<?php

namespace Geonef\Zig\Util;

abstract class Variable
{
  /**
   * Convert value to a JSON-compatible type
   *
   * Objects & resources are converted to string,
   * arrays are processed recursively, other types
   * are not changed.
   *
   * @param mixed $value
   * @return mixed
   */
  public static function toJsonValue($value) {
    if (is_object($value)) {
      $ret = static::objectToString($value);
    } elseif (is_resource($value)) {
      $ret = static::resourceToString($value);
    } elseif (is_array($value)) {
      $ret = array();
      foreach ($value as $key => $sub) {
        $ret[$key] = static::toJsonValue($sub);
      }
    } else {
      $ret = $value;
    }
    //$c[$n] = strval($v);
    return $ret;
  }

  public static function backtraceToJsonValue(\Exception $e)
  {
    $trace = $e->getTrace();
    $out = array();
    foreach ($trace as $call) {
      $c = array();
      foreach ($call as $n => $v) {
        $c[$n] = static::toJsonValue($v);
      }
      $out[] = $c;
    }
    return $out;
  }

  public static function objectToString($obj)
  {
    return get_class($obj);
    //return 'grr1';
    return method_exists($obj, '__toString') ?
      $obj->__toString() : ('<Object '.get_class($obj).'>');
  }

  public static function resourceToString($res)
  {
    //return 'grr';
    return sprintf('<Resource %s>', get_resource_type($res));
  }
}
