<?php

namespace Geonef\ZigBundle\Document;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\ZigBundle\Document\FileHandler;
use Geonef\Zig\Util\Exec;

use Doctrine\ODM\MongoDB\Mapping\Annotations as Doctrine;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\InheritanceType;
use Doctrine\ODM\MongoDB\Mapping\Annotations\DiscriminatorField;
use Doctrine\ODM\MongoDB\Mapping\Annotations\DiscriminatorMap;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Int;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\EmbedMany;

/**
 * @Document
 * @InheritanceType("SINGLE_COLLECTION")
 * @DiscriminatorField(fieldName="module")
 * @DiscriminatorMap({
 *      "Directory" = "Geonef\ZigBundle\Document\File\Directory",
 *      "GridFs" = "Geonef\ZigBundle\Document\File\GridFs"
 *  })
 */
class File
{
  const EVENT_PREFIX = 'model.geonefZig.file';

  /**
   * @Id
   */
  public $uuid;

  /**
   * @MongoString
   */
  public $name;

  /**
   * @Int
   */
  public $size;

  /**
   * Defined handlers
   *
   *      "OgrDataSource"="Geonef\PloomapBundle\Document\FileHandler\OgrDataSource"
   *
   * @EmbedMany(
   *    discriminatorField="type",
   *    discriminatorMap={
   *      "Image"="Geonef\ZigBundle\Document\FileHandler\Image",
   *      "Zip"="Geonef\ZigBundle\Document\FileHandler\Zip"
   *    }
   * )
   */
  public $handlers = array();

  /**
   * @MongoString
   */
  public $contentType;

  /**
   * @Doctrine\Date
   */
  public $uploadedAt;

  /**
   * @Doctrine\ReferenceOne(targetDocument = "Geonef\ZigBundle\Document\User")
   */
  public $uploadedBy;

  /**
   *
   */
  protected $container;

  protected $logger;

  protected $dm;

  public function __construct(ContainerInterface $container)
  {
    $this->setContainer($container);
  }

  public function getId()
  {
    return $this->uuid;
  }

  public function getName()
  {
    return $this->name;
  }

  public function setName($name)
  {
    $this->name = $name;
  }

  /**
   * Safe method to get an uploaded file
   *
   * @return static
   */
  public static function createFromUpload($name, ContainerInterface $container)
  {
    static $errors = array
      (UPLOAD_ERR_OK => 'success',
       UPLOAD_ERR_INI_SIZE => 'size:ini',
       UPLOAD_ERR_FORM_SIZE => 'size:form',
       UPLOAD_ERR_PARTIAL => 'missing:partial',
       UPLOAD_ERR_NO_FILE => 'missing:file',
       UPLOAD_ERR_NO_TMP_DIR => 'server:missingTempDir',
       UPLOAD_ERR_CANT_WRITE => 'server:notWritableTempDir',
       UPLOAD_ERR_EXTENSION => 'format:invalidExtension');
    if (!isset($_FILES[$name])) {
      throw new \Exception('file not uploaded: '.$name);
    }
    if ($_FILES[$name]['error'] !== UPLOAD_ERR_OK) {
      throw new \Exception('upload error ('.$_FILES[$name]['error']
                           .'): '.$errors[$_FILES[$name]['error']]);
    }
    $path = $_FILES[$name]['tmp_name'];
    if (!is_uploaded_file($path)) {
      throw new \Exception('not an uploaded file: '.$path);
    }
    $file = new File\GridFs($container);
    $file->setFile($path);
    $file->setName($_FILES[$name]['name']);
    return $file;
    //move_uploaded_file($path, $this->record->getAbsolutePath());
  }

  public function setContainer(ContainerInterface $container)
  {
    $this->container = $container;
    $this->logger = $this->container->get('logger');
    $this->dm = $this->container
      ->get('doctrine.odm.mongodb.documentManager');
    // TODO: check if we can get the container from postLoad event
  }

  /**
   * Get an instance of the given handler
   *
   * @param $name string  handler name (key in discriminator map)
   * @return File\FileHandler
   */
  public function getHandler($name)
  {
    $handlers = is_array($this->handlers) ?
      $this->handlers : $this->handlers->toArray();
    $classes = array_map('get_class', $handlers);
    $key = array_search($name, $classes);
    if ($key !== false) {
      $handler = $this->handlers[$key];
      $handler->setFile($this, $container);
      return $handler;
    }
    $class = $this->getHandlerClass($name);
    if (!call_user_func(array($class, 'doesSupport'), $this)) {
      throw new \Exception('handler not does support file: '.$this->uuid.': '.$name);
    }
    $handler = new $class($this, $this->container);
    $this->handlers[] = $handler;
    return $handler;
  }

  protected function getHandlerMap()
  {
    $metadata = $this->dm->getClassMetadata(get_class($this));
    //var_dump($metadata);
    return $metadata->fieldMappings['handlers']['discriminatorMap'];
  }

  protected function getHandlerClass($name)
  {
    $map = $this->getHandlerMap();
    if (!isset($map[$name])) {
      throw new \Exception('handler not defined in discriminator map: '.$name);
    }
    $class = $map[$name];
    if (!is_subclass_of($class, 'Geonef\ZigBundle\Document\FileHandler')) {
      throw new \Exception('class must implement FileHandler: '.$class);
    }
    return $class;
  }

  /**
   * Get whether the file is supported by the given handler
   *
   * @param $name string  handler name (key in discriminator map)
   * @return boolean
   */
  public function isSupportedByHandler($name)
  {
    $class = $this->getHandlerClass($name);
    return call_user_func(array($class, 'doesSupport'), $this);
  }

  /**
   * Return handlers supporting this file
   *
   * @return array of string
   */
  public function getSupportedHandlerNames($classes = false)
  {
    $supported = array();
    $map = $this->getHandlerMap();
    foreach ($map as $name => $class) {
      if (call_user_func(array($class, 'doesSupport'), $this)) {
        $supported[$class] = $name;
      }
    }
    return $supported;
  }

  public function syncSupportedHandlers()
  {
    $names = $this->getSupportedHandlerNames(true);
    $handlers = array();
    /*foreach ($this->handlers as $handler) {
      $class = get_class($handler);
      if (isset($names[$class])) {
        $handlers[] = $handler;
        unset($names[$class]);
      }
      }*/
    foreach ($names as $name) {
      $handlers[] = $this->getHandler($name);
    }
    $this->handlers = $handlers;
    return $handlers;
  }

  public function getContentType()
  {
    if (!$this->contentType) {
      $cmd = new Exec('file', array('-bi', $this->getPath()),
                      $this->container->get('logger'));
      if ($cmd->execute(array('output' => 'get',
                              'exceptionOnFailure' => false)) === 0) {
        $out = $cmd->getOutput();
        $type = reset($out);
        $type = explode(';', $type, 2);
        $this->contentType = trim($type[0]);
      } else {
        $this->contentType = 'application/octet-stream';
      }
    }
    return $this->contentType;
  }

  public function getPath()
  {
    throw new \Exception('must be overloaded');
  }

  public function getSize()
  {
    throw new \Exception('must be overloaded');
  }

  public function stat()
  {
    $this->contentType = null;
    $this->getContentType();
    $this->syncSupportedHandlers();
    $this->size = $this->getSize();
  }

}

