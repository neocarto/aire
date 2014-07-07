<?php

namespace Geonef\Zig\View\Helper;

use \Geonef\Zig\View\ViewInterface;

/**
 * View helper for generating XML tags
 *
 * @package Zig
 * @subpackage View
 * @author Jeff Gigand <gigand@jitcom.fr>
 */
class XmlTag
{
  protected $view;

  public function __construct(ViewInterface $view)
  {
    $this->view = $view;
  }

  /**
   * Generate an XML tag and return the code
   *
   * @param string	$name		tag name : 'a', 'div', 'p' ...
   * @param array	$attrs		associative array of HTML attributes
   * @param string	$content	HTML code to insert within the tag
   * @return string			HTML code
   */
  public function tag($name, $attrs = array(), $content = null)
  {
    if (is_array($name)) {
      return $this->tag
        ($name['tag'],
         isset($name['attributes']) ? $name['attributes'] : null,
         isset($name['content']) ? $name['content'] : null);
    }
    if (!is_array($attrs)) {
      $attrs = array();
    }
    $s = '<' . $name;
    if (count($attrs)) {
      foreach ($attrs as $n => $v) {
        $s .= ' ' . $n . '="' . strtr($v, array('"' => '&quot;')) . '"';
      }
    }
    if (is_array($content)) {
      $self = $this;
      $content = implode('', array_map(function($m) use ($self)
        { return $self->tag($m); }, $content));
    }
    if (is_string($content) || is_numeric($content)) {
      $content = strtr($content, array("\n" => "\n  "));
      $s .= '>' . $content . '</' . $name . '>';
    } else {
      $s .= '/>';
    }
    return "\n" . $s;
  }

  /**
   * Default call to the object: forwarded to tag()
   *
   */
  public function __invoke($name, $attrs = array(), $content = null)
  {
    //throw new \Exception('grrr');
    //var_dump($name, $attrs, $content);exit;
    return $this->tag($name, $attrs, $content);
  }
}
