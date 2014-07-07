<?php

namespace Geonef\Zig\Util;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ODM\MongoDB\Proxy\Proxy;
use Doctrine\ODM\MongoDB\MongoDBException;

/**
 * Various static methods which are meant to used temporarily in development
 */
class Dev
{
  /**
   * Always get real document - reloaded if it was previously proxied
   *
   */
  public static function getRealDocument($document, $dm = null)
  {
    //return $document;
    /*if (get_class($document) == 'Proxies\\ZigBundleZigBundleDocumentFileProxy') {
      var_dump($document);exit;
      }*/
    if ($document instanceof Proxy) {
    //\Doctrine\ODM\MongoDB\Proxy\Proxy) {
      // Ugly workaround for Doctrine behaviour
      // Happens when the same doc has already been referred to
      // through another doc's ref mapping (where use of Proxy is legitimate
      // IF THE DOC CLASS HAS NO DISCRIMINATOR MAP).
      // The problem is, the proxy is still used for regular 1st level-
      // query results, and discriminator maps are ignored
      /*if (isset($document->__dm)) {
        $dm = $document->__dm;
        $id = $document->__identifier;
        } else {*/
      if (!$dm) {
        throw new \Exception('dm not provided!');
      }
      $id = $document->getId();
      //}
      $uow = $dm->getUnitOfWork();
      $uow->removeFromIdentityMap($document);
      $parents = class_parents($document);
      $document = $dm->find(reset($parents), $id);
    }
    return $document;
  }

  /**
   * Same as DocumentManager::find($class, $id), but throw an exception if not found
   */
  public static function findDocument($class, $id, $documentManager)
  {
    $doc = $documentManager->find($class, $id);
    if (!$doc) {
      throw new \Exception('document not found in class '.$class.': '.$id);
    }
    return $doc;
  }

  public static function arrayToDocument($array, $documentClass, ContainerInterface $container)
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    // check if $array is an identifier; if so, find the doc and return it
    if (!is_array($array)) {
      $doc = $dm->find($documentClass, $array);
      if (!$doc) {
        throw new \Exception('arg is assumed to be ID ('.$array
                             .') for class '.$documentClass
                             .' but doc is not found');
      }
      return $doc;
    }
    // do we already have the object, or just the class?
    if (is_object($documentClass)) {
      $doc = $documentClass;
      $effDocumentClass = $documentClass = get_class($doc);
    } else {
      //if ($debug == 2) { var_dump($documentClass); exit; }
      $metaData = $dm->getRepository($documentClass)->getClassMetadata();
      // take care of the discriminator field?
      if ($metaData->discriminatorField) {
        $field = $metaData->discriminatorField['name'];
        if (!isset($array[$field])) {
          throw new \Exception('discriminator field "'.$field
                               .'" is not defined'
                               .' in structure for '.$documentClass);
        }
        $discrV = $array[$field];
        //unset($array[$field]); // is it needed?
        $effDocumentClass = $metaData->discriminatorMap[$discrV];
      } else {
        $effDocumentClass = $documentClass;
      }
      // do we need to search the given ID or create a new document?
      if (isset($array[$metaData->identifier])) {
        $uuid = $array[$metaData->identifier];
        $doc = $dm->find($effDocumentClass, $uuid);
        //$doc = $dm->findOne($effDocumentClass,
        //                    array(/*$metaData->identifier*/'uuid' => $uuid));
        if (!$doc) {
          throw new \Exception('did not find '.$effDocumentClass
                               .' with ID: '.$uuid);
        }
        $effDocumentClass = get_class($doc);
      } else {
        $doc = new $effDocumentClass;
      }
    }
    $effMetaData = $dm->getRepository($effDocumentClass)->getClassMetaData();
    // main loop, process each field mapping
    foreach ($effMetaData->fieldMappings as $mapping) {
      $prop = $mapping['name'];
      if (array_key_exists($prop, $array)) {
        switch ($mapping['type']) {
        case 'many':
          if (isset($mapping['embedded']) && $mapping['embedded']) {
            // we recreate the collection, with correct order
            /*if (is_array($doc->$prop)) {
              $doc->$prop = new ArrayCollection($doc->$prop);
              }*/
            if (is_array($doc->$prop)) {
              $doc->$prop = new ArrayCollection($doc->$prop);
            }
            $coll = $doc->$prop;
            //$container->get('logger')->debug('GRR: subObj:'.get_class($coll));
            //$origCollection = new ArrayCollection
            //  (is_array($doc->$prop) ? $doc->$prop : $doc->$prop->slice(0));
            //$doc->$prop = new ArrayCollection();
            //$container->get('logger')->debug('GRR: clear');
            $values = $coll->getValues();
            $origCollection = new ArrayCollection($values);
            foreach ($values as $el) {
              $coll->removeElement($el);
            }
            //$coll->clear();

            //$_processed = new ArrayCollection();
            $_i = 0;
            foreach ($array[$prop] as $subArray) {
              $_i++;
              // take care of the discriminator field?
              if (isset($mapping['discriminatorField']) &&
                  strlen($mapping['discriminatorField']) > 0) {
                $subClass = $mapping['discriminatorMap']
                  [$subArray[$mapping['discriminatorField']]];
              } else {
                $subClass = $mapping['targetDocument'];
              }
              $subMetaData = $dm->getRepository($subClass)->getClassMetadata();
              $idField = $subMetaData->identifier;
              // -- ALWAYS CREATE A NEW DOC (workaround for headaches)
              if (isset($subArray[$idField])) {
                unset($subArray[$idField]);
              }
              // -- END WORKAROUND
              // fetch embedded doc with given ID, or create a new one?
              if (isset($subArray[$idField]) &&
                  strlen($subArray[$idField]) > 0) {
                // ID specified: find & update it
                $_f = $origCollection->filter
                  (function($obj) use ($subArray, $idField) {
                    return $obj->$idField == $subArray[$idField];
                  });
                if (!$_f->count()) {
                  throw new \Exception('embedded doc not found with ID: '
                                       . $subArray[$idField]);
                }
                $subObj = static::arrayToDocument($subArray, $_f->first(),
                                                  $container);
                //$container->get('logger')->debug('GRR: updated subObj');
              } else {
                // ID not specified: create a new document
                $subObj = static::arrayToDocument($subArray, $subClass,
                                                  $container);
                $subObj->$idField = uniqid('', true);
                /*if (!is_object($doc->$prop)) {
                  //file_put_contents('/tmp/grr', '-'.$prop.'-'
                  //                  .gettype($doc->$prop));
                  }*/
                //$container->get('logger')->debug('GRR: created subobj');
              }
              // whatever the doc was updated or created, add it
              //$container->get('logger')->debug('GRR: add subObj to prop');
              $coll->add($subObj);
              //$_processed->add($subObj);
            }
            // no need to delete: remaining sub-docs were ignored anyway
            // now, delete remaining objects from the collection
            /*$toDelete = $doc->$prop
              ->filter(function($obj) use ($_processed)
              { return !$_processed->contains($obj); });*/
            /*foreach ($toDelete as $obj) {
              $doc->$prop->removeElement($obj);
              }*/
            //$container->get('logger')->debug('GRR: count:'.$coll->count());

          } else {
            throw new \Exception
              ('type "many" but not embedded, not implemented');
          }
          break;
        case 'one':
          $subClass = $mapping['targetDocument'];
          $subObj = $array[$prop] ?
            static::arrayToDocument($array[$prop], $subClass, $container) :
            null;
          $doc->$prop = $subObj;
          break;
        case 'string':
        default:
          $method = 'set' . ucfirst($prop);
          if (method_exists($doc, $method)) {
            $doc->$method($array[$prop]);
          } else {
            $doc->$prop = $array[$prop];
          }
        }
      }
    }
    return $doc;
  }

  public static function documentToArray($document,
                                         ContainerInterface $container)
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $document = static::getRealDocument($document, $dm);
    $documentClass = get_class($document);
    $metaData = $dm->getRepository($documentClass)->getClassMetadata();
    $array = array();
    //self::logDump($container, 'GET DOC '.$document->getId().' - '.$documentClass);
    if ($metaData->discriminatorValue) {
      $dField = $metaData->discriminatorField['name'];
      $array[$dField] =
        array_search($documentClass, $metaData->discriminatorMap);
      //self::logDump($container, $metaData->discriminatorMap);
    }
    /* ob_start(); */
    /* var_dump($metaData); */
    /* $s = ob_get_contents(); */
    /* ob_end_clean(); */
    /* foreach (explode("\n", $s) as $l) */
    /*   $container->get('logger')->debug('oka:'.$l); */
    foreach ($metaData->fieldMappings as $mapping) {
      $prop = $mapping['fieldName'];
      switch ($mapping['type']) {
      case 'many':
        foreach ($document->$prop as $subDoc) {
          if (isset($mapping['embedded']) && $mapping['embedded']) {
            $subArray = static::documentToArray($subDoc, $container);
            if (count($mapping['discriminatorMap'])) {
              $key = array_search(get_class($subDoc), $mapping['discriminatorMap']);
              if ($key !== false) {
                $subArray[$mapping['discriminatorField']] = $key;
              }
            }
            $array[$prop][] = $subArray;
          } else {
            $array[$prop][] = $subDoc; // todo: convert to array
          }
        }
        /*$array[$prop][]
         if (is_object($document->$prop)) {
         $array[$prop] = $document->$prop->toArray();
         } else {
         $array[$prop] = $document->$prop;
         }*/
        break;
      case 'one':
        if ($document->$prop) {
          if (isset($mapping['embedded']) && $mapping['embedded']) {
            $array[$prop] = static::documentToArray
              ($document->$prop, $container);
          } else {
            try {
              $array[$prop] = array($metaData->identifier =>
                                    $document->$prop->getId());
            }
            catch (MongoDBException $e) {
              // target document is missing, just ignore it
            }
          }
        } else {
          $array[$prop] = null;
        }
        break;
      default:
        $value = $document->$prop;
        if (is_object($value) && $value instanceof \DateTime) {
          $value = $value->getTimestamp();
        }
        $array[$prop] = $value;
      }
    }
    return $array;
  }

  public static function logDump(ContainerInterface $container, $val, $prefix = 'dump: ', $type = 'debug')
  {
    ob_start();
    var_dump($val);
    $str = ob_get_contents();
    ob_end_clean();
    $logger = $container->get('logger');
    foreach (explode("\n", trim($str)) as $line) {
      $logger->$type($line);
    }
  }

  public static function dump($val, $logger, $prefix = 'dump: ')
  {
    ob_start();
    var_dump($val);
    $str = ob_get_contents();
    ob_end_clean();
    //$logger = $container->get('logger');
    foreach (explode("\n", trim($str)) as $line) {
      $logger->debug($prefix.$line);
    }
  }


}
