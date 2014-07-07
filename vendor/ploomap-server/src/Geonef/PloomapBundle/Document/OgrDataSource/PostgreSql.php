<?php

namespace Geonef\PloomapBundle\Document\OgrDataSource;

use Geonef\PloomapBundle\Document\OgrDataSource as BaseClass;
use Geonef\PloomapBundle\Document\OgrLayer;
use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;

/**
 * @Document
 */
class PostgreSql extends BaseClass
{
  /**
   * @MongoString
   */
  public $database;

  /**
   * @MongoString
   */
  public $user;

  /**
   * @MongoString
   */
  public $password;

  /**
   * @MongoString
   */
  public $host;

  /**
   * @MongoString
   */
  public $port;

  /**
   * Check validity of document properties
   *
   * @param $container ContainerInterface
   * @param $errors    array
   * @return boolean    Whether the map properties are valid
   */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = true;
    foreach (array('database', 'user', 'password', 'host', 'port') as $prop) {
      $state &= $this->checkCond(strlen($this->$prop) > 0,
                                 $prop, 'missing', $errors);
    }
    if (!isset($errors['port'])) {
      $state &= $this->checkCond(ctype_digit($this->port) && $this->port > 0,
                                 'port', 'invalid', $errors);
    }
    if ($state) {
      $state &= parent::checkProperties($container, $errors);
    }
    return $state;
  }

  public function getSourcePath(ContainerInterface $container)
  {
    $props = array('database' => 'dbname', 'user' => 'user',
                   'password' => 'password', 'host' => 'host',
                   'port' => 'port');
    $args = array();
    foreach ($props as $n => $v) {
      if ($this->$n) {
        $args[] = $v . "='" . $this->$n . "'";
      }
    }
    return "PG:" . implode(' ', $args);
  }

  public function getMsLayerConnection(ContainerInterface $container, OgrLayer $layer)
  {
    return array(MS_POSTGIS, substr($this->getSourcePath($container), 3),
                 $layer->getName());
  }

  public function getModuleName()
  {
    return 'PostgreSql';
  }

}
