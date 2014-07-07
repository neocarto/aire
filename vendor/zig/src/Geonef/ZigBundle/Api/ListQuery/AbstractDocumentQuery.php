<?php

namespace Geonef\ZigBundle\Api\ListQuery;

use Doctrine\Common\Collections\ArrayCollection;
use Geonef\Zig\Util\Dev;
use Geonef\Zig\Util\Mongo;

abstract class AbstractDocumentQuery extends AbstractQuery
{
  protected $documentClass;

  /**
   * @var Doctrine\ODM\MongoDB\DocumentManager
   */
  protected $documentManager;

  protected $titleProp = 'name';

  ///////////////////////////////////////////////////////////////
  // INIT - HOOKS
  //

  protected function preDispatch()
  {
    if (isset($this->request['locale'])) {
      $locale = $this->request['locale'];
      //$this->response['originLocale'] = $this->container->get('session')->getLocale();
      $this->container->get('session')->setLocale($locale);
      $translatable = $this->container->get('stof_doctrine_extensions.listener.translatable');
      $translatable->setTranslatableLocale($locale);
      //$translatable->setSkipOnLoad(true); // test
    }
    $this->documentManager =
      $this->container->get('doctrine.odm.mongodb.documentManager');
    /*if (isset($this->request['modelClass'])) {
      $this->documentClass .= '\\' . $this->request['modelClass'];
      }*/
    parent::preDispatch();
  }

  protected function postDispatch()
  {
    $this->response['locale'] = $this->container->get('session')->getLocale();
    $this->documentManager->flush();
  }

  protected function beforePersist($document)
  {
    // hook
  }


  ///////////////////////////////////////////////////////////////
  // LIST QUERY
  //

  /**
   * Instanciate query and return the object
   */
  protected function createQueryObject()
  {
    $this->query = $this->documentManager->createQueryBuilder
      ($this->getDocumentClass());
  }

  /**
   * {@inheritdoc}
   */
  protected function defineSelect()
  {
    // by default, select all properties
  }

  protected function defineFilters()
  {
    $query = $this->query;
    $addRegexpMatch = function($prop, $regexp, $not) use ($query) {
      $code = strtr('function() { return './*'this._prop_ &&'.*/' _not_ '
                    .' /_regexp_/i.test(this._prop_); }',
                    array('_prop_' => $prop,
                          '_regexp_' => $regexp,
                          '_not_' => $not ? '!' : ''));
      $query->field($prop)->where($code);
      return $code;
    };
    if (isset($this->request['filters'])) {
      foreach ($this->request['filters'] as $oProp => $filter) {
        $prop = $this->translateField($oProp);
        if ($filter === null) { continue; }
        if (is_array($filter)) {
          if (!isset($filter['value'])) {
            throw new \Exception('filter on "'.$prop.'": missing value');
          }
          $value = $filter['value'];
          $op = isset($filter['op']) ? $filter['op'] : 'equals';
          $not = isset($filter['not']) ? $filter['not'] : false;
        } else {
          $value = $filter;
          $op = 'equals';
          $not = false;
        }
        $method = 'defineFilter'.ucfirst($oProp);
        if (method_exists($this, $method)) {
          $this->$method($value, $op, $not);
          continue;
        }
        switch ($op) {
        case 'ref':
          $this->query->field($prop.'.$id')->equals(new \MongoId($value));
          break;
        case 'exists':
          $this->query->field($prop.'.$id')->exists($value);
          break;
        case 'equals':
        case 'notEqual':
        case 'lt':
        case 'lte':
        case 'gt':
        case 'gte':
          if ($not) {
            $rev = array('equals' => 'notEqual', 'notEqual' => 'equals',
                         'lt' => 'gte', 'gte' => 'lt',
                         'lte' => 'gt', 'gt' => 'lte');
            $op = $rev[$op];
          }
          $this->query->field($prop)->$op($value);
          break;
        case 'contains':
          $this->query->field($prop)->where
            ('function() { return this.'.$prop.' && '
             .'this.'.$prop.'.toLowerCase().indexOf(\''
             .str_replace('\'', '\\\'', strtolower($value)).'\') '
             .($not?'===':'!==').' -1; }');
          break;
        case 'beginWith':
          $code = $addRegexpMatch($prop, '^' . $value, $not);
          $this->response['debug'] = $code;
          break;
        case 'endWith':
          $addRegexpMatch($prop, $value . '$', $not);
          break;
        case 'regexp':
          $addRegexpMatch($prop, $value, $not);
          break;
        case 'referredByMany':
          $doc = $this->find($value);
          $value = array();
          foreach ($doc->$prop as $sub) {
            $value[] = new \MongoId($sub->uuid);
          }
          $prop = '_id';
          //$this->response['dd'] = $value;
          // sic
        case 'in':
          $this->query->field($prop)->in($value);
          break;
        default:
          throw new \Exception('filter on "'.$prop.'": invalid op: '.$op);
        }
      }
    }
  }

  protected function defineSorting()
  {
    if (isset($this->request['sort']) &&
        isset($this->request['sort']['name'])) {
      $desc = isset($this->request['sort']['desc']) &&
        $this->request['sort']['desc'];
      $col = $this->translateField($this->request['sort']['name']);
      $this->query->sort($col, $desc ? 'desc' : 'asc');
    }
  }

  protected function fetchResult()
  {
    $pageLength = isset($this->request['pageLength']) ?
      intval($this->request['pageLength']) : static::PAGE_LENGTH;
    if (!$pageLength) {
      throw new \Exception('list query: pageLength is null');
    }
    $cursor = $this->query->getQuery()->execute();
    if ($this->page !== null && !$this->disablePagination) {
      $numPages = intval(ceil($cursor->count() / $pageLength));
      if ($this->page > $numPages) {
        $this->page = $numPages;
      }
      $this->response['numResults'] = $cursor->count();
      $this->response['pageLength'] = $pageLength;
      $this->response['numPages'] = $numPages;
      $this->response['currentPage'] = $this->page;
      $cursor = $this->query
        ->skip(($this->page - 1) * $pageLength)
        ->limit($pageLength)
        ->getQuery()->execute();
    }
    $this->response['rows'] = array();
    if ($cursor->count() > 0) {
      foreach ($cursor as $record) {
        //$orig = $this->documentManager->getUnitOfWork()->getOriginalDocumentData($record);
        //$this->container->get('logger')->debug('cache, Document OID='.spl_object_hash($record));
        //\Geonef\Zig\Util\Dev::dump($orig, $this->container->get('logger'), 'cache-list-dump: ');
        $this->response['rows'][] = $this->composeRowStructure($record);
      }
    }
  }

  /**
   * Default concrete implementation. The returned type must be JSON-serializable.
   */
  protected function composeRowStructure($doc)
  {
    $array = $this->modelToArray($doc);
    if (method_exists($doc, 'getPropValidity')) {
      $array['propValidity'] = $doc->getPropValidity($this->container);
    }

    return $array;
  }


  ///////////////////////////////////////////////////////////////
  // OTHER ACTIONS
  //

  public function getModuleListAction()
  {
    $metaData = $this->getMetaData();
    $list = array();
    if (!is_array($metaData->discriminatorMap)) {
      throw new \Exception('discriminator map required');
    }
    foreach ($metaData->discriminatorMap as $name => $class) {
      if ($name == '_abstract') { continue; }
      $list[] = array('name' => $name,
                      'label' => $name);
    }
    $this->response['modules'] = $list;
  }

  public function loadDocumentAction()
  {
    $uuid = $this->request['uuid'];
    $doc = $this->find($uuid);
    $array = $this->modelToArray($doc);
    if (method_exists($doc, 'getPropValidity')) {
      $array['propValidity'] = $doc->getPropValidity($this->container);
    }
    $this->response['value'] = $array;
  }

  public function saveDocumentAction()
  {
    $this->response['submittedValue'] = $this->request['value'];
    $doc = $this->arrayToModel($this->request['value']);
    $this->beforePersist($doc);
    if (!$doc->getId()) {
      $this->documentManager->persist($doc);
    }
    $this->response['flushSize'] =
      $this->documentManager->getUnitOfWork()->size();
    $this->documentManager->flush();
    $doc = $this->find($doc->getId());
    $value = $this->modelToArray($doc);
    if (method_exists($doc, 'getPropValidity')) {
      $value['propValidity'] = $doc->getPropValidity($this->container);
    }
    $this->response['value'] = $value;
    return $doc;
  }

  /**
   * Check object properties
   *
   * Act both as a protected and public action method
   */
  /* public function checkPropertiesAction($doc = null) */
  /* { */
  /*   if (!$doc) { */
  /*     $doc = $this->find($this->request['uuid']); */
  /*   } */
  /*   if (!method_exists($doc, 'checkProperties')) { */
  /*     throw new \Exception('class does not support checkProperties: ' */
  /*                          .get_class($doc)); */
  /*   } */
  /*   $errors = array(); */
  /*   $status = $doc->checkProperties($this->container, $errors); */
  /*   $this->response['check'] = array */
  /*     ('valid' => $status, 'errors' => $errors); */
  /* } */

  public function deleteAction()
  {
    $uuids = $this->request['uuids'];
    foreach ($uuids as $uuid) {
      $doc = $this->find($uuid);
      if ($this->preDeleteOne($doc)) {
        $this->documentManager->remove($doc);
        $this->response['removed'][] = $uuid;
        $this->postDeleteOne($doc);
      } else {
        $this->response['kept'][] = $uuid;
      }
    }
    // flush is done in postDispatch()
  }

  /**
   * Hook, called before one document is deleted
   *
   * @param object $doc         the document about to be deleted
   * @return boolean            return false to cancel deletion
   */
  protected function preDeleteOne($doc)
  {
    return true;
  }

  /**
   * Hook, called after one deletion (and before beforeAllDelete() event)
   *
   * @param object $doc         the document about to be deleted
   */
  protected function postDeleteOne($doc)
  {
  }

  public function duplicateAction()
  {
    $dm = $this->documentManager;
    if (isset($this->request['uuid'])) {
      $uuid = $this->request['uuid'];
      $doc = $this->find($uuid);
      $this->duplicateDoc($doc, $this->request['title']);
    }
    if (isset($this->request['uuids'])) {
      $uuids = $this->request['uuids'];
      $pattern = $this->request['pattern'];
      $titleProp = $this->titleProp;
      foreach ($uuids as $uuid) {
        $doc = $this->find($uuid);
        $title = str_replace('%', $doc->$titleProp, $pattern);
        $this->duplicateDoc($doc, $title);
      }
    }
  }

  protected function duplicateDoc($doc, $title)
  {
    $dup = Mongo::duplicateDocument($this->container, $doc);
    $dm = $this->documentManager;
    // $class = get_class($doc);
    // $dup = new $class;
    // foreach (array_keys($this->getMetaData($doc)->fieldMappings) as $prop) {
    //   $dup->$prop = $doc->$prop;
    // }
    $titleProp = $this->titleProp;
    $dup->$titleProp = $title;
    //$dm->persist($dup);
    $dm->flush();
    //$dm->detach($dup);
    return $dup;
  }

  /**
   * Return info about document fields
   *
   * If 'uuid' is provided, given doc is used for metaData.
   * Otherwise, if 'dicriminator' is provided, class is translated
   * from discriminator map.
   * Otherwise, this->documentClass is used.
   */
  public function getMetaDataAction()
  {
    $documentClass = $this->documentClass;
    if (isset($this->request['uuid'])) {
      $metaData = $this->getMetaData($this->find($this->request['uuid']));
    } elseif (isset($this->request['discriminator'])) {
      $metaData = $this->getMetaData($this->getDocumentClass
                                     ($this->request['discriminator']));
    }
    $this->response['fieldMappings'] = $metaData->fieldMappings;
    $this->response['isEmbeddedDocument'] = $metaData->isEmbeddedDocument;
    $this->response['metaData'] = $metaData; // debug
  }

  ///////////////////////////////////////////////////////////////



  ///////////////////////////////////////////////////////////////
  // UTILS
  //

  /**
   * Find a doc with given ID through the base class
   *
   * @param $uuid string        ID of the document to find
   * @return Object
   */
  protected function find($uuid, $noProxy = false)
  {
    $document = $this->documentManager->find($this->documentClass, $uuid);
    if (!$document) {
      throw new \Exception('document not found: '.$uuid);
    }
    if ($noProxy) {
      $document = Dev::getRealDocument($document, $this->documentManager);
    }
    return $document;
  }

  /**
   * Return $this->documentClass, or matching class if discriminator is specified
   *
   * @param $discriminator string       optional discriminator value to match the class
   * @return string
   */
  protected function getDocumentClass($discriminator = null)
  {
    if ($discriminator) {
      $metaData = $this->getMetaData();
      if (!isset($metaData->discriminatorMap[$discriminator])) {
        throw new \Exception('invalid '.$this->documentClass
                             .' discriminator value: '.$discriminator);
      }
      return $metaData->discriminatorMap[$discriminator];
    }
    return $this->documentClass;
  }

  /**
   * Get metaData for document class
   *
   * If no class is given, the base class ($this->documentClass) is used.
   * If a doc is given, metaData is returned about it's class.
   *
   * @param $class mixed        class or document
   */
  protected function getMetaData($class = null)
  {
    if (!$class) {
      $class = $this->documentClass;
    } else {
      if (is_object($class)) {
        $class = get_class($class);
      }
    }
    return $this->documentManager->getClassMetadata($class);
  }

  protected function modelToArray($document)
  {
    return Dev::documentToArray($document, $this->container);
  }

  protected function arrayToModel($array)
  {
    return Dev::arrayToDocument($array, $this->documentClass,
                                $this->container);
  }
}
