<?php

namespace Geonef\PloomapBundle\Document\MapCollection;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PloomapBundle\Document\MapCollection as AbstractMapCollection;
use Geonef\Ploomap\Util\Geo;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Boolean;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Gedmo\Mapping\Annotation\Translatable;

/**
 * Base class for published map collections. Not meant to be instanciated.
 *
 */
class Published extends AbstractMapCollection
{
  /**
   * @Boolean
   */
  public $published;

  /**
   * @Translatable
   * @MongoString
   */
  public $comment;

  public function getCategory()
  {
    return $this->category;
  }

  public function isPublished()
  {
    return $this->published;
  }

  public function getComment()
  {
    return $this->comment;
  }

  public function hasComment()
  {
    return trim($this->comment) != '';
  }

  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    $state &= $this->checkCond($this->category,
                               'category', 'missing', $errors) &&
      $this->checkCond($this->category->getId(),
                       'category', 'invalid', $errors);
    return $state;
  }
}
