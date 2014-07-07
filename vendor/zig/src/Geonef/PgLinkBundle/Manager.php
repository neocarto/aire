<?php

namespace Geonef\PgLinkBundle;

use Geonef\PgLinkBundle\Document\Table;

/**
 * PgLink manager
 *
 * Root class managing the whole PgLink architecture.
 *
 * @author Jean-Francois Gigand <jean-francois@gigand.fr>
 */
class Manager
{
  protected $database;

  public function __construct(Database $database)
  {
    $this->database = $database;
  }

  public function getDatabase()
  {
    return $this->database;
  }

  public function createSeparateView()
  {
    $table = new Table;
    $view = $table->createView();
    return $view;
  }

}
