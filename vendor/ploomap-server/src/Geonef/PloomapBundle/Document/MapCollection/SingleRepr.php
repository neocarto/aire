<?php

namespace Geonef\PloomapBundle\Document\MapCollection;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PloomapBundle\Document\MapCollection\Published;
use Geonef\Ploomap\Util\Geo;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;

/**
 * Used for collections having one single map, or one map per language.
 *
 * This map collection is meant to contain one map for each language.
 * The maps are identified through their "level" property,
 * which is supposed to container the 2 chars language code ("fr", "en"...).
 *
 * @Document
 */
class SingleRepr extends Published
{

  /**
   * Default language - set to NULL not to take language into account
   *
   * @MongoString
   */
  public $defaultLanguage;

  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    return $state;
  }

  /**
   * @return Geonef\PloomapBundle\Document\Map
   */
  public function autoGetMap(ContainerInterface $container)
  {
    $lang = $this->defaultLanguage;
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $query = $dm->getRepository('Geonef\PloomapBundle\Document\Map')->createQueryBuilder();
    $query->field('level')->equals($lang);
    $it = $query->getQuery()->execute();
    if ($it->count() == 0) {
      throw new \Exception("aucune carte avec level=".$leng
                           ." dans la collection SingleRepr");
    }

    return $it->getSingleResult();
  }

}
