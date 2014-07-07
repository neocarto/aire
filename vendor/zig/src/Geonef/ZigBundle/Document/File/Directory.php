<?php

namespace Geonef\ZigBundle\Document\File;

use Geonef\ZigBundle\Document\File as AbstractFile;
use Geonef\ZigBundle\Document\File\GridFS;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\Zig\Util\FileSystem;
use Geonef\Zig\Util\Dev;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceMany;

/**
 * @Document
 */
class Directory extends AbstractFile
{

  /**
   * Children files
   *
   * @ReferenceMany(
   *            targetDocument="Geonef\ZigBundle\Document\File")
   */
  public $children = array();

  protected $basePath;

  protected $path;

  public $contentType = 'directory';


  public function setContainer(ContainerInterface $container)
  {
    parent::setContainer($container);
    $base = $this->container->getParameter('kernel.cache_dir');
    $this->basePath = FileSystem::makePath($base, 'zigDirectories');
  }

  public function getPath()
  {
    if (!$this->path) {
      $this->path = $this->makePath();
      if (!is_dir($this->path)) {
        $this->mkdir($this->path);
      }
      $this->writeFiles();
    }
    return $this->path;
  }

  public function getChildren()
  {
    $children = array();
    foreach ($this->children as $child) {
      $child = Dev::getRealDocument($child, $this->dm);
      $child->setContainer($this->container);
      $children[] = $child;
    }
    return $children;
  }

  public function addChild(AbstractFile $child)
  {
    $child->setContainer($this->container);
    $this->children[] = $child;
  }

  public function addFiles($names)
  {
    foreach ($names as $name) {
      $path = FileSystem::getAbsolutePath($name, $this->getPath());
      if (!file_exists($path)) {
        throw new \Exception('file does not exist: '.$path);
      }
      $child = new GridFs($this->container);
      $child->setName($name);
      $child->setFile($path);
      $this->addChild($child);
      $this->dm->persist($child);
    }
    $this->stat();
  }

  protected function writeFiles()
  {
    $children = $this->getChildren();
    foreach ($children as $child) {
      $path = $child->getPath($this->path);
      //$this->logger->debug('*** file: '.$path);
    }
  }

  protected function makePath()
  {
    $id = $this->uuid || uniqid('odm_', true);
    $path = FileSystem::makePath($this->basePath, $id);
    return $path;
  }

  protected function mkdir($path)
  {
    try {
      if (!mkdir($path)) {
        throw new \Exception('failed to create directory: '.$path);
      }
    }
    catch (\Exception $e) {
      throw new \Exception('exception "'.$e->getMessage().'" on mkdir: '.$path, 0, $e);
    }
  }

  public function getContentType()
  {
    return 'directory';
  }

  public function getSize()
  {
    return count($this->children);
  }

}
