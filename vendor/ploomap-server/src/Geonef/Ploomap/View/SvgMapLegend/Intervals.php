<?php

namespace Geonef\Ploomap\View\SvgMapLegend;

use Geonef\Zig\Registry\Mapper;
use Geonef\Zig\Util\Number;

/**
 * Legend for intervals (Ratio, etc)
 *
 */
class Intervals extends Base
{
  /**
   * @RegistryMapValue
   */
  public $intervals;

  /**
   * @RegistryMapValue
   */
  public $maximum;

  /**
   * @RegistryMapValue
   */
  public $polygonOutlineColor;

  /**
   * Set classes and other properties for intervals
   *
   * @RegistryMapSetter(key="classes")
   */
  public function setClasses(array $classes)
  {
    Mapper::mapObject($classes, $this);
  }

  protected function buildContent()
  {
    return $this->builIntervals();
  }

  protected function builIntervals()
  {
    if (!is_array($this->intervals)) {
      throw new \Exception('intervals not defined (not an array) for ratio classes');
    }
    $els = array();
    $xOffset = 0 * $this->sizeFactor;
    $hMargin = 6 * $this->sizeFactor;
    $vMargin = 6 * $this->sizeFactor;
    $minOffset = 0 * $this->sizeFactor;
    $maxOffset = 0 * $this->sizeFactor;
    $topMargin = 10 * $this->sizeFactor;
    $bottomMargin = 0 * $this->sizeFactor; // 5
    $rw = static::RECT_WIDTH * $this->sizeFactor;
    $rh = static::RECT_HEIGHT * $this->sizeFactor;
    $this->yOffset += $topMargin;
    foreach ($this->intervals as $class) {
      $style = 'stroke-width:'.(0.5*$this->sizeFactor).';stroke:#333'//.$this->polygonOutlineColor
        .';fill:'.$class['color'].';';
      $els[] = $this->tag('rect', array('x' => $xOffset, 'y' => $this->yOffset,
                                        'width' => $rw, 'height' => $rh,
                                        'style' => $style));
      if (isset($class['minimum'])) {
        $els[] = $this->tag('text', array('x' => $xOffset + $rw + $hMargin,
                                          'y' => $this->yOffset + $minOffset,
                                          'class' => 'classLimit'),
                            Number::roundDigits($class['minimum'], 2));
      }
      $this->yOffset += $rh + $vMargin;
    }
    if ($this->maximum) {
      $els[] = $this->tag('text', array('x' => $xOffset + $rw + $hMargin,
                                        'y' => $this->yOffset + $maxOffset,
                                        'class' => 'classLimit'),
                          Number::roundDigits($this->maximum, 2));
    }
    $this->yOffset += $rh + /*$vMargin +*/ $bottomMargin;

    return implode($els);
  }

}
