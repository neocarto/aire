<?php

namespace Geonef\Zig\Util;

/**
 * Utiliy functions for string manipulation
 *
 * @package     Zig
 * @subpackage  Util
 * @author      okapi <okapi@lapatate.org>
 */
abstract class String
{

  /**
   * Remove all latin accents
   *
   * @todo make this work properly once and for all!!!
   * @param string $str
   * @return string
   */
  static public function removeAccents($str)
  {
    return iconv("utf-8", "ascii//TRANSLIT", $str);
  }

  /**
   * Convert CamelCaseStrings to dashed-style-strings
   *
   * Example: "CamelCase" becomes "camel-case"
   * The reverse operation is done by static::dashesToUcwords()
   *
   * @param string $str
   * @return string
   */
  static public function ucwordsToDashes($str)
  {
    return strtolower
      (substr(ereg_replace('([A-Z])', '-\\1', $str), 1));
  }

  /**
   * Convert a dashed-style-string to a CamelCaseString
   *
   * Example: "camel-case" becomes "CamelCase"
   * The reverse operation is done by static::ucwordsToDashes()
   *
   * @param string $str
   * @return string
   */
  static public function dashesToUcwords($str)
  {
    return implode('', array_map('ucfirst', explode('-', $str)));
  }

  /**
   * Convert to Zend_Class_Style
   *
   * Same as dashesToUcwords(), but also makes all underscores followed
   * by an uppercase.
   *
   * @param string $str
   * @return string
   */
  public static function classify($str)
  {
    return implode('_', array_map('ucfirst',
                                  explode('_', (static::dashesToUcwords($str)))));
  }

  /**
   * Make the string not longer than $length chars, showing '...' if needed
   *
   * If the string overflows, it is truncated to $length - 4
   * and 3 dots ' ...' is append to the end.
   *
   * @param string $str
   * @param integer $length
   */
  static public function limitLength($str, $length = 42, $append = ' ...')
  {
    $overflow = strlen($str) > $length;
    if ($overflow) {
      $str = substr($str, 0, $length - strlen($append)) . $append;
    }
    return $str;
  }

  /**
   * Count the common prefix between $str1 and $str2
   *
   *
   * @param string $str1
   * @param string $str2
   * @return integer
   */
  public static function commonPrefixLength($str1, $str2)
  {
    $len = min(strlen($str1), strlen($str2));
    $count = 1;
    while ($count <= $len) {
      if (strncmp($str1, $str2, $count)) {
        break;
      }
      $count++;
    }
    return $count - 1;
  }

  public static function escapeXmlEntities($str)
  {
    return strtr($str, array(
                             '&' => '&#38;',
                             '>' => '&#62;',
                             '<' => '&#60;'));
  }

  public static function substitute($template, $map)
  {
    $str = preg_replace_callback
      ('/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/',
       function($match) use ($map) {
        $key = $match[1];
        $value = is_object($map) ? $map->$key : $map[$key];

        return $value;
      }, $template);
    return $str;
  }

}

//////////////////////////////////////////////////////////////////////
// Functions (none at the moment)
