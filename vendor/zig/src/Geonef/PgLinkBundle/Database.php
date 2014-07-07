<?php

namespace Geonef\PgLinkBundle;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * PgLink PostgreSQL database manipulation
 *
 * It is standalone. Needs connection params.
 * Used by manager; doesn't use the manager.
 *
 * @author Jean-Francois Gigand <jean-francois@gigand.fr>
 */
class Database
{
  protected $params = array();
  protected $connection = null;
  protected $logger;

  public function __construct($logger, $name, $user, $password)
  {
    $this->logger = $logger;
    $this->params['dbname'] = $name;
    $this->params['user'] = $user;
    $this->params['password'] = $password;
    $this->params['host'] = 'localhost';
  }

  public function getName()
  {
    return isset($this->params['dbname']) ? $this->params['dbname'] : null;
  }

  public function runInTransaction($queries)
  {
    if (count($queries) > 1) {
      $this->query('BEGIN');
    }
    foreach ($queries as $query) {
      $this->query($query);
    }
    if (count($queries) > 1) {
      $this->query('COMMIT');
    }
  }

  public function query($query)
  {
    $cnt = $this->getConnection();
    $res = pg_query($cnt, $query);
    if (!$res) {
      if ($this->logger) {
        $this->logger->warn('PgLink query: '.$query);
        $this->logger->warn('PgLink query: '.pg_last_error($cnt));
      }
      throw new \Exception('PG query failed: '.$query);
    } elseif ($this->logger) {
      $this->logger->info('PgLink query: '.$query);
    }
    return $res;
  }

  public function getConnectionString()
  {
    $els = array();
    foreach ($this->params as $key => $val) {
      $els[] = $key.'='.$val;
    }
    return implode(' ', $els);
  }

  protected function getConnection()
  {
    if (!$this->connection) {
      $str = $this->getConnectionString();
      $this->connection = pg_connect($str);
      if (!$this->connection) {
        throw new \Exception('failed to connect to PG using: '.$str);
      }
    }
    return $this->connection;
  }

  public function findTables(ContainerInterface $container, $query = array())
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $repos = $dm->getRepository('Geonef\PgLinkBundle\Document\Table');
    return $repos->findBy($query);
  }

  public function getView(ContainerInterface $container, $viewId)
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $repos = $dm->getRepository('Geonef\PgLinkBundle\Document\View');
    $view = $repos->find($viewId);
    if (!$view) {
      throw new \Exception('view not found: '.$viewId);
    }
    return $view;
  }

  public function findViews(ContainerInterface $container, $query = array())
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $repos = $dm->getRepository('Geonef\PgLinkBundle\Document\View');
    return $repos->findBy($query);
  }

  public function tableExists($tableName)
  {
    $res = $this->query("SELECT EXISTS (SELECT relname FROM pg_class "
                        ."WHERE relname='".$tableName."')");
    $row = pg_fetch_array($res);
    return $row[0] == 't';
  }

  public function columnExists($tableName, $columnName)
  {
    $res = $this->query("SELECT EXISTS "
                        ."(SELECT attname FROM pg_attribute WHERE attrelid ="
                        ." (SELECT oid FROM pg_class WHERE relname = '"
                        .$tableName."') AND attname = '".$columnName."')");

    $row = pg_fetch_array($res);
    return $row[0] == 't';
  }
}
