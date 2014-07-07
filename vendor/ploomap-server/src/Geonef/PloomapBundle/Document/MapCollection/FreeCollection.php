<?php
namespace Geonef\PloomapBundle\Document\MapCollection;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PloomapBundle\Document\MapCollection as AbstractMapCollection;
use Geonef\Ploomap\Util\Geo;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;

/**
 * Multiple maps, no constraints. Kind of abstract container for maps.
 *
 * @Document
 */
class FreeCollection extends AbstractMapCollection
{

  public function isPublished()
  {
    return true;
  }

  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    return $state;
  }

  /**
   * Fetch map of this map collection having the given representation and level
   *
   * @param $container
   * @param $representation     representation name ('stock', 'ratio'...)
   * @param $level              level name ('nuts0','nuts1'...)
   */
  public function getMap(ContainerInterface $container, $level = null)
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $q = $dm->createQueryBuilder
      ('Geonef\PloomapBundle\Document\Map')
      ->field('mapCollection.$id')->equals(new \MongoId($this->uuid));
    if ($level) {
      $q->field('level')->equals($level);
    }
    return $q->getQuery()->execute()->getSingleResult();
  }
}
