<?php

namespace Geonef\Zig\Util\Dom;

use DOMDocument;
use DOMXpath;
use Geonef\Zig\Util\CssParser\CssParser;
use Symfony\Component\CssSelector\CssSelector;

/**
 * Static utility methods related to SVG DOM manipulation
 */
abstract class Svg
{
  const NS = 'http://www.w3.org/2000/svg';


  /**
   * Parse given CSS and apply it to the document, as inline attributes
   *
   * The elements matching the given CSS selectors are found, and
   * CSS rules are applied to it as attributes.
   *
   * Example: g.test > rect { fill: #ff0; }
   *   will create the attribute on <rect>, like:
   *   <g><rect fill="#ff0"/></g>
   *
   * @param DOMDocument $doc
   * @param string $cssString
   */
  public static function inlineCss(DOMDocument $doc, $cssString, $l)
  {
    $parser = new CssParser($cssString);
    $css = $parser->parse();
    $selectors = $css->getAllSelectors();
    $xp = new DOMXPath($doc);
    //$xp->registerNamespace(null, static::NS);
    $xp->registerNamespace('svg', static::NS);
    foreach ($selectors as $selector) {
      foreach ($selector->getSelector() as $sel) {
        //\Geonef\Zig\Util\Dev::dump($sel, $l, 'transf X');
        $xpq = CssSelector::toXPath($sel);
        $list = $xp->query($xpq);
        $l->debug('transformed CSS sel '.$sel.' to XPath: '.$xpq.', got '.$list->length.' elements');
        foreach ($list as $el) {
          foreach ($selector->getRules() as $rule) {
            $attr = $rule->getRule();
            $val = array();
            foreach ($rule->getValues() as $value) {
              $val[] = (string) $value[0];
            }
            $value = implode(' ', $val);
            $el->setAttribute($attr, $value);
          }
        }
      }
    }
  }

  public static function addCssDefs(DOMDocument $doc, $cssString)
  {
    $xp = new DOMXPath($doc);
    $xp->registerNamespace('svg', static::NS);
    $nl = $xp->query("/svg:svg/svg:defs");
    if ($nl->length == 0) {
      $defs = $doc->createElementNs(static::NS, 'defs');
      $doc->documentElement->insertBefore
        ($defs, $doc->documentElement->firstChild);
    } else {
      $defs = $nl->item(0);
    }
    $style = $doc->createElementNs(static::NS, 'style');
    $style->setAttribute('type', 'text/css');
    $cdata = $doc->createCDATASection($this->additionalCss);
    $style->appendChild($cdata);
    $defs->appendChild($style);
  }

}
