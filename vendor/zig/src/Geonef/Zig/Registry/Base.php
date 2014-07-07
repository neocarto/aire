<?php

namespace Geonef\Zig\Registry;
use \Geonef\Zig\Registry\Loader;
use \Geonef\Zig\Pattern\Singleton;
use \Geonef\Zig\Util\ArrayAssoc;
use \Geonef\Zig\Registry\Mapper;

class Base implements Singleton
{
  protected $_loader;
  protected $_data;

  public function __construct($loader)
  {
    $this->_loader = $loader;
    $this->_data = $this->_loader->load();
  }

  /**
   * {@inheritdoc}
   */
  public static function getInstance()
  {
    static $_instance = null;
    if (!$_instance) {
      $_instance = new static; //\X\Geonef\Zig\Registry\Base();
    }
    return $_instance;
  }

  public function &get($path)
  {
    return ArrayAssoc::getPath($this->_data, $path);
  }

  public function getObject($path)
  {
    $node =& $this->get($path);
    $obj = Mapper::mapObject($node);
    if (!is_object($obj)) {
      var_dump($node);
      var_dump($obj);
    }
    return $obj;
  }

}
