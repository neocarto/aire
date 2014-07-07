<?php

namespace Geonef\Zig\Util;

use DOMDocument;

/**
 * Static utility methods related to DOM manipulation
 */
abstract class Dom
{
  /**
   * Same as DOMDocument::loadXML(), managing errors as exceptions
   *
   * @param $xmlString string   The string containing the XML.
   * @return DOMDocument        Loaded DOM document
   * @throw Exception
   */
  public static function loadXmlString($xmlString)
  {
    $xmlErr = '';
    set_error_handler(function($n, $str) use (&$xmlErr) { $xmlErr = $str; });
    $svgDoc = new DOMDocument();
    $svgDoc->loadXML($xmlString);
    restore_error_handler();
    if ($xmlErr) {
      throw new \Exception($xmlErr);
    }
    return $svgDoc;
  }

  /**
   * Same as DOMDocument::load(), managing errors as exceptions
   *
   * @param $xmlPath string     Path to XML file
   * @return DOMDocument        Loaded DOM document
   * @throw Exception
   */
  public static function loadXmlFile($xmlPath)
  {
    $xmlErr = '';
    set_error_handler(function($n, $str) use (&$xmlErr) { $xmlErr = $str; });
    $svgDoc = new DOMDocument();
    $svgDoc->load($xmlPath);
    restore_error_handler();
    if ($xmlErr) {
      throw new \Exception($xmlErr);
    }
    return $svgDoc;
  }

  public static function createTextElement(DOMDocument $doc, $nodeName, $content, $ns = null)
  {
    if ($ns) {
      $element = $doc->createElementNS($ns, $nodeName);
    } else {
      $element = $doc->createElement($nodeName);
    }
    $text = $doc->createTextNode($content);
    $element->appendChild($text);

    return $element;
  }

}
