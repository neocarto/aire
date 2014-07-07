<?php

namespace Geonef\Zig\Util;

abstract class Number
{
  public static function roundDigits($val, $digits = 3)
  {
    $d = $val > 0 ? floor(log10($val)) + 1 : 1;
    $needed = $digits - $d;
    if ($needed > 0) {
      $mult = pow(10, $needed);
      return round($val * $mult) / $mult;
    } else {
      return round($val);
    }
  }

  public static function removeNullsFromList(&$values)
  {
    $nullKeys = array_keys($values, '');
    foreach ($nullKeys as $key) {
      unset($values[$key]);
    }
    return $nullKeys;
  }

  public static function getListStatistics(&$values)
  {
    $tCount = count($values);
    $nullKeys = static::removeNullsFromList($values);
    $values = array_map('floatval', $values);
    sort($values);
    $count = count($values);
    if (!$count) {
      $more = count($tCount) ? ' ('.$tCount.' NULL values, actually)' : '';
      throw new \Exception('no value in list'.$more.'; cannot compute statistics');
    }
    // compute median
    $h = intval($count / 2);
    if ($count % 2 == 0) {
      $median = ($values[$h] + $values[$h - 1]) / 2;
    } else {
      $median = $values[$h];
    }
    // compute standard deviation
    $valueSquares = array_map(function($v) { return pow($v, 2); }, $values);
    $standardDeviation =
      sqrt(array_sum($valueSquares) / $count -
           pow((array_sum($values) / $count), 2));
    // make statistics array
    $stats = array
      ('count' => $count,
       'nullCount' => count($nullKeys),
       'minimum' => min($values),
       'maximum' => max($values),
       'average' => array_sum($values) / $count,
       'median' => $median,
       'standardDeviation' => $standardDeviation
       );
    return $stats;
  }
}
