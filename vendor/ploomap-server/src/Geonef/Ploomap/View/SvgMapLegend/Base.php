<?php

namespace Geonef\Ploomap\View\SvgMapLegend;

use Geonef\Zig\Util\Number;

/**
 * Common base class for interval and circle legends.
 *
 */
abstract class Base extends AbstractLegend
{
  const NS = 'http://www.w3.org/2000/svg';

  const RECT_WIDTH = 30;
  const RECT_HEIGHT = 20;

  /**
   * Map legend title
   *
   * @var string
   * @RegistryMapValue
   */
  public $title;

  /**
   * Map unit
   *
   * @var string
   * @RegistryMapValue
   */
  public $unit;

  /**
   * Average value of data
   *
   * @var float
   * @RegistryMapValue
   */
  public $average;

  /**
   * Whether the data list has NULL values
   *
   * @var boolean
   * @RegistryMapValue
   */
  public $hasNull;

  /**
   * @RegistryMapValue
   */
  public $polygonNullFillColor;

  /**
   * @RegistryMapValue
   */
  public $text;

  /**
   * Helper: XmlTag
   *
   * @var Object
   * @RegistryMapInstanciate(
   *    class = "Geonef\Zig\View\Helper\XmlTag",
   *    passThis = true
   *  )
   */
  public $tag;


  public function build()
  {
    return $this->tag('g',  array('xmlns' => self::NS, 'class' => 'legend'),
                      $this->buildLegendContent());
  }

  protected function buildLegendContent()
  {
    return
      $this->buildTitle()
      //. $this->buildUnit() // in title already
      . $this->buildContent()
      . $this->buildAverage()
      . $this->buildHasNull()
      . $this->buildText();
  }

  protected function buildTitle()
  {
    $title = $this->title.' ('.$this->unit.')';
    return $this->wrapText($title, array('class' => 'title'));
  }

  protected function buildUnit()
  {
    return $this->wrapText($this->unit, array('class' => 'unit'));
  }

  abstract protected function buildContent();

  protected function buildAverage()
  {
    if ($this->average != 0) {
      return $this->wrapText($this->translator->trans('geonef.ploomap.legend.average')
                             .' : '.Number::roundDigits($this->average, 2)
                             .' '.$this->unit,
                             array('class' => 'average'));
    }
  }

  protected function buildHasNull()
  {
    $hMargin = 6 * $this->sizeFactor;
    $bottomMargin = 30 * $this->sizeFactor;
    $nodataMargin = 14 * $this->sizeFactor;
    $rw = static::RECT_WIDTH * $this->sizeFactor;
      $rh = static::RECT_HEIGHT * $this->sizeFactor;
    if (!$this->hasNull) {

      return;
    }
    $els = array();
    $style = 'stroke-width:'.(0.5*$this->sizeFactor).';stroke:#333'//.$this->polygonOutlineColor
      .';fill:'.$this->polygonNullFillColor.';';
    $els[] = $this->tag('rect', array('x' => 0, 'y' => $this->yOffset,
                                      'width' => $rw, 'height' => $rh,
                                      'style' => $style));
    $els[] = $this->tag('text', array('x' => $rw + $hMargin,
                                      'y' => $this->yOffset + $nodataMargin,
                                      'class' => 'nodata'),
                        'Absence de données');
    $this->yOffset += $rh + $bottomMargin;

    return implode($els);;
  }

  protected function buildText()
  {
    return $this->text ? $this->wrapText($this->text,
                                         array('class' => 'text')) : '';
  }

  /**
   * Forward call to member objects (helper handling)
   *
   * @return mixed
   */
  public function __call($name, $args)
  {
    if (isset($this->$name)) {
      return call_user_func_array(array($this->$name, '__invoke'), $args);
    }
    throw new \Exception('Call to undefined method: ' . $name);
  }

}
