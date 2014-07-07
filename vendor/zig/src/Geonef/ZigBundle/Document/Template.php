<?php

namespace Geonef\ZigBundle\Document;

use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\InheritanceType;
use Doctrine\ODM\MongoDB\Mapping\Annotations\DiscriminatorField;
use Doctrine\ODM\MongoDB\Mapping\Annotations\DiscriminatorMap;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Hash;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Date;
use Gedmo\Mapping\Annotation\Locale;

/**
 * @Document
 * @InheritanceType("SINGLE_COLLECTION")
 * @DiscriminatorField(fieldName="module")
 * @DiscriminatorMap({
 *      "SvgMap" = "Geonef\PloomapBundle\Document\Template\SvgMap",
 *      "Text"   = "Geonef\ZigBundle\Document\Template\Text"
 *  })
 */
abstract class Template
{
  const EVENT_PREFIX = 'model.geonefZig.template';

  /**
   * @Id
   */
  public $uuid;

  /**
   * @MongoString
   */
  public $name;

  /**
   * @Hash
   */
  public $propValidity = array();

  /**
   * @Date
   */
  public $lastEditedAt;

  /**
   * Cache for various information
   *
   * The method syncInfoCache() should be used to make sure
   * the cache is not out-of-date, when not sure.
   *
   * @Hash
   */
  public $infoCache = array();

  /**
   * Set by apply(), or getContentType() must be overloaded
   */
  protected $applyContentType;

  /**
   * Set by apply(), or getContent() must be overloaded
   */
  protected $applyContent;

  public function __construct()
  {
    $this->lastEditedAt = new \DateTime();
  }

  public function getId()
  {
    return $this->uuid;
  }

  public function getName()
  {
    return $this->name;
  }

  /**
   * Clears the infoCache, along with assets which depend on properties
   *
   * It can be called from anywhere to force clearing the cache,
   * for example, to get new cached info after changes but before flush.
   *
   * @return boolean    Whether the infoCache has been cleared (false if already empty)
   */
  public function clearInfoCache()
  {
    // clear infoCache
    if (count($this->infoCache)) {
      $this->infoCache = array();
      $ret = true;
    } else {
      $ret = false;
    }

    return $ret;
  }

  //
  // PROPERTY VALIDITY
  //

  public function getPropValidity(ContainerInterface $container)
  {
    $translatable = $container->get('stof_doctrine_extensions.listener.translatable');
    $locale = $translatable->getListenerLocale();
    if (!isset($this->infoCache['propValidity'][$locale]['valid'])) {
      $errors = array();
      $isValid = $this->checkProperties($container, $errors);
      $this->infoCache['propValidity'][$locale] =
        array('valid' => $isValid, 'errors' => $errors);
    }
    return $this->infoCache['propValidity'][$locale];
  }

  /**
   * Check validity of the properties
   *
   * @param $container ContainerInterface
   * @param $errors    array
   * @return boolean    Whether the properties are valid
   */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = true;
    $state &= $this->checkCond(strlen(trim($this->name)) > 0,
                               'name', array('invalid', "Obligatoire"),
                               $errors);

    return $state;
  }

  /**
   * Facility for checkProperties()
   *
   * @param $cond boolean
   * @param $prop string
   * @param $msg string
   * @param $errors array
   */
  protected function checkCond($cond, $prop, $msg, &$errors)
  {
    if (!$cond) {
      $errors[$prop] = $msg;
      return false;
    }
    return true;
  }

  //
  //
  //

  public function getSupportedClasses()
  {
    return array();
  }

  /**
   * Apply
   *
   * @param $document object Document object to apply the template to
   * @return integer Size of result, in bytes
   */
  public function applyTo(ContainerInterface $container, $document)
  {
    $errors = array();
    if (!$this->getPropValidity($container)) {
      throw new \Exception('cannot apply template: invalid properties');
    }
    $this->applyContent = $this->doApply($container, $document);

    return $this->applyContent;
  }

  public function getContentType()
  {
    return $this->applyContentType;
  }

  public function getContent()
  {
    return $this->applyContent;
  }

  abstract protected function doApply(ContainerInterface $container, $document);

}
