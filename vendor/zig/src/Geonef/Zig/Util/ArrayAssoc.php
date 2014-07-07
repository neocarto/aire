<?php
namespace Geonef\Zig\Util;

use \Exception;

/**
 * Utiliy functions for associative array manipulation
 *
 * This class cannot not be instanciated. It only has static methods.
 *
 * @package		Zig
 * @subpackage          Util
 * @author		okapi <okapi@lapatate.org>
 */
abstract class ArrayAssoc
{
  /**
   * Quick recursive access to references array (sub)values (JS-like syntax)
   *
   * Given a dot-separated path, return the value. It can be a string,
   * number, boolean, or array.
   *
   * Suppose $refNode is something like:
   * 		array('a1' => array('a11' => 11, 'a12' => 12),
   *                  'a2' => array('a21' => 21, 'a22' => array('a221' => 221, 'a222' => 222)))
   *
   * Values can be accessed easily:
   * 		getPath($refNode, 'a1.a12')			// returns integer 12
   * 		getPath($refNode, 'a2.a22.a221')	// returns integer 222
   *
   * Dots can be escaped with a backslash to avoid being used as a separator.
   *
   * This method returns a reference, which allows later modification.
   *
   * About references, PHP brings the magical behaviour "lazy affectation".
   *
   * It means that if the path does not exist, it is returned anyway
   * as an unset value (reference only). Then, affecting a value will
   * make it exist.
   *
   * For example, with the same $refNode as above:
   * 		$value = getPath($refNode, 'a1.a19.z.y.x');
   * 		// isset($value) is FALSE
   * 		$value = 42;
   * 		// isset($value) is TRUE
   * 		$sub = getPath($refNode, 'a1.a19');
   * 		// isset($sub) is TRUE
   * 		// $sub is: array('z' => array('y' => array('z' => 42)))
   *
   * @param string $path		dot-separated path
   * @param array $refNode	reference to base array to process
   * @return mixed			reference to the value
   */
  public static function &getPath(&$refNode, $path)
  {
    if ($path === null) {
      return $refNode;
    }
    $dot = uniqid();
    $p = explode('.', str_replace('\.', $dot, $path));
    $current =& $refNode;
    foreach ($p as $_key) {
      if ($_key == '') {
        continue;
      }
      $key = str_replace($dot, '.', $_key);
      if (is_array($current) || !isset($current)) {
        $current =& $current[$key];
      } else {
        throw new Exception("requested key/path '$key' on "
                            . "non-structure value '$current'\n");
      }
    }
    return $current;
  }

  /**
   * Similar to array_walk_recursive(), but calls callback differently
   *
   * The callback function receives 3 arguments:
   * 		- the container array
   * 		- the name of the key
   * 		- the value
   *
   * @param array		$array			array to walk
   * @param callback	$function		function to call on each element
   */
  public static function walkRecursive(&$array, $function)
  {
    if (!is_array($array)) {
      throw new Exception('arg 1 is not an array: '.print_r($array, true));
    }
    foreach ($array as $key => &$val) {
      $function($array, $key, $val);
      if (is_array($val)) {
        static::walkRecursive($val, $function);
      }
    }
  }

  /**
   * Similar to array_replace_recursive(), but modifies 1st array (reference)
   *
   * This function does not return anything.
   *
   * @param array		$array		array to overwrite - directly modified
   * @param array		$mixin		array to extract values which are
   * 								merged into $array
   */
  public static function replaceRecursive(&$array, $mixin)
  {
    foreach ($mixin as $key => $val) {
      if (is_array($val)) {
        static::replaceRecursive($array[$key], $val);
      } else {
        $array[$key] = $val;
      }
    }
  }

  /**
   * Go through $node recursively and process keys like "a.b.c"
   *
   * array("a.b.c" => 42) is replaced with:
   * array('a' => array('b' => array('c' => 42)))
   */
  public static function expandSubKeys(&$node)
  {
    //printf("processSubKeys: %s\n", print_r($node, true));
    $refs = array();
    static::walkRecursive($node,
                          function (&$node, $key, &$value) use (&$refs) {
                            if (strpos($key, '.') !== false) {
                              $refs[] = array(&$node, $key, &$value);
                            }
                          });
    foreach ($refs as &$case) {
      $ref =& static::getPath($case[0], $case[1]);
      $ref = $case[2];
      unset ($case[0][$case[1]]);
    }
  }

}
