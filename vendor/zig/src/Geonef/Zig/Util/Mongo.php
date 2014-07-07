<?php

namespace Geonef\Zig\Util;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Common\Collections\ArrayCollection;

class Mongo
{
  /**
   * Duplicate the given document (except identifier.. really?)
   *
   * The new document is automatically persisted but not flushed.
   *
   * @param $container ContainerInterface
   * @param $document Any MongoDB ODM document object
   * @return a MongoDB ODM object whose class is same as $document's
   */
  public static function duplicateDocument(ContainerInterface $container,
                                           $document) {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $logger = $container->get('logger');
    $class = get_class($document);
    $dup = new $class;
    $metaData = $dm->getClassMetadata($class);
    foreach ($metaData->fieldMappings as $name => $field) {
      if ($name == $metaData->identifier) { continue; }
      $val = $document->$name;
      if ($val && isset($field['embedded']) && $field['embedded']) {
        if ($field['type'] == 'many') {
          foreach ($val as $subDoc) {
            $logger->debug('OKA 42 '.$name.' | '.get_class($subDoc));
            $dupSubDoc = static::duplicateDocument($container, $subDoc);
            //Dev::logDump($container, $dupSubDoc);
            $dup->$name->add($dupSubDoc);
          }
        }
      } else {
        $dup->$name = $val;
      }
    }
    $dm->persist($dup);
    return $dup;
  }
}
