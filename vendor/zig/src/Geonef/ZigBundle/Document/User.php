<?php

namespace Geonef\ZigBundle\Document;

use FOS\UserBundle\Document\User as BaseUser;
use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

/**
 * @MongoDB\Document
 */
class User extends BaseUser
{
  /**
   * @MongoDB\Id
   */
  protected $id;

  /**
   * @MongoDB\String
   */
  public $subscriptionCode;


  public function __construct()
  {
    parent::__construct();
  }

  public function exportJsInfo()
  {
    $d = array();
    $props = array('id', 'username', 'email', 'createdAt', 'lastLogin');
    foreach ($props as $p) {
      $d[$p] = $this->$p;
    }
    $d['icon'] = $this->getIcon();
    return $d;
  }

  public function getSummaryData()
  {
    $d = array('id' => $this->id,
               'username' => $this->username,
               'icon' => $this->getIcon());

    return $d;
  }

  public function getIcon()
  {
    $md5 = md5(strtolower($this->email));
    return 'http://www.gravatar.com/avatar/' . $md5 . '?s=32&d=monsterid';
  }

}