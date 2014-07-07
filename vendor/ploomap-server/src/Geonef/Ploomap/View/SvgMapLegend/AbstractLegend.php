<?php

namespace Geonef\Ploomap\View\SvgMapLegend;

use Geonef\Zig\View\ViewInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Geonef\Zig\Util\Number;

/**
 * Base classe for LEGEND views
 *
 * A child of this class will usually be instanciated through the
 * Registry mapper, based on the structure returned by Map::getlegendData().
 *
 */
abstract class AbstractLegend implements ViewInterface
{
  const WRAP_LENGTH = 30; // 25

  /**
   * Legend size factor
   *
   * @var float
   * @RegistryMapValue
   */
  public $sizeFactor = 1.0;

  /**
   * Map render resolution (for proportional symbol in proj units)
   *
   * @var float
   * @RegistryMapValue
   */
  public $resolution;

  /**
   * Translator object
   */
  protected $translator;

  protected $yOffset = 5;


  public function setTranslator(TranslatorInterface $translator)
  {
    $this->translator = $translator;
  }

  public function addYOffset($nb)
  {
    $this->yOffset += $nb;
  }

  public function getYOffset()
  {
    return $this->yOffset;
  }

  /**
   * Utility method to wrap text in multiple <text> lines
   *
   * @param string      $text   Text to wrap
   * @param array       $attrs  Additional attributes for <text> nodes
   */
  protected function wrapText($text, $attrs = array())
  {
    $bottomMargin = 6 * $this->sizeFactor;
    $lineHeight = 18 * $this->sizeFactor;

    $t = explode('!!!', wordwrap($text, static::WRAP_LENGTH, '!!!', true));
    $els = array();
    foreach ($t as $line) {
      $els[] = $this->tag('text',
                          array_merge(array('x' => 0, 'y' => $this->yOffset), $attrs),
                          $line);
      $this->yOffset += $lineHeight;
    }
    $this->yOffset += $bottomMargin;

    return implode($els);
  }

}
