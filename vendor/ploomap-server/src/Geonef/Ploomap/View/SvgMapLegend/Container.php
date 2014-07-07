<?php

namespace Geonef\Ploomap\View\SvgMapLegend;

use \Geonef\Zig\View\ViewInterface;

throw new \Exception('UNUSED');
// UNUSED

/**
 * View for for building SVG legend
 *
 * This class will usually be instanciated through the
 * Registry mapper, based on the structure returned by Map::getlegendData().
 * In turn
 *
 */
class SvgMapLegend implements ViewInterface
{
  const NS = 'http://www.w3.org/2000/svg';

  /**
   * Content of <body> element
   *
   * @var string
   * @RegistryMapValue
   */
  public $widgetClass;

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
    return $this->tag('g', array('xmlns' => self::NS), $htis->buildLegendContent());
  }

  protected function buildLegendContent()
  {
  }

}
