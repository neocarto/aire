<?php

namespace Geonef\Zig\Registry\Loader;

use \Geonef\Zig\Util\ArrayAssoc;
use \Exception;

/**
 * Base class for registry loaders
 *
 * @todo Clarify object model: _data property not used;
 * 		 in this code, all methods could be static
 *
 * @author okapi <okapi@lapatate.org>
 *
 */
abstract class AbstractLoader
{
  /**
   * NOT USED (fixme)
   *
   * @var array
   */
  protected $_data;

  public function __construct($path = null)
  {
    $this->path = $path;
  }

  /**
   * Load the root node and return it
   *
   * @return \ArrayAccess
   */
  public function load($path = null)
  {
    //printf("loading file: %s\n", $path);
    $data = $this->loadRaw($path);
    $this->processSubKeys($data);
    $this->processMagicKeys($data);
    return $data;
  }

  /**
   *
   * @Return \ArrayAccess
   */
  abstract public function loadRaw($path = null);

  /**
   * Go through $node recursively and process keys like "a.b.c"
   */
  protected function processSubKeys(&$node)
  {
    //printf("processSubKeys: %s\n", print_r($node, true));
    $refs = array();
    ArrayAssoc::walkRecursive($node,
                              function (&$node, $key, &$value) use (&$refs) {
				if (strpos($key, '.') !== false) {
                                  $refs[] = array(&$node, $key, &$value);
				}
                              });
    foreach ($refs as &$case) {
      $ref =& ArrayAssoc::getPath($case[0], $case[1]);
      $ref = $case[2];
      unset ($case[0][$case[1]]);
    }
  }

  /**
   * Go through $node recursively and process magic keys
   *
   * Magic keys begin with '__'. They have a magic behaviour through this
   * function. '__inherits' keys are substituted
   *
   * @param &$node	&array	ref to data array (modified)
   */
  protected function processMagicKeys(&$node)
  {
    $refs = array();
    ArrayAssoc::walkRecursive($node,
                              function (&$node, $key, &$value) use (&$refs) {
				if (strpos($key, '__inherits') === 0) {
                                  $refs[] = array(&$node, $key, &$value);
				}
                              });
    foreach ($refs as &$case) {
      if (is_string($case[2])) {
        $this->processInheritage($case[0], $case[2]);
      }/* elseif (is_array($case[2])) {
        foreach ($case[2] as $_k => $path) {
        $this->processInheritage($node, $path);
        }
        }*/ else {
        throw new Exception('__inherits has a non-string value');
      }
      unset ($case[0][$case[1]]);
    }
  }

  /**
   * Load inheritage source and merge the arrays
   */
  private function processInheritage(&$node, $path)
  {
    $l = explode('::', $path, 2);
    /*if (trim($l[0]) == '') {
     $l[0] = $fileName;
     }*/
    $data = $this->load($l[0]);
    if (isset($l[1]) && strlen($l[1]) > 0) {
      $data = ArrayAssoc::getPath($data, $l[1]);
      if (!isset($data)) {
        throw new Exception('Key not found : "'.$l[1].'" in file "'
                            .$l[0].'"');
      }
    }
    if (!is_array($data)) {
      $data = array($data);
    }
    ArrayAssoc::replaceRecursive($node, $data);
  }

}
