<?php

namespace Geonef\Zig\View\Document;

use \Geonef\Zig\View\ViewInterface;
use \Geonef\Zig\Util\FileSystem;

class XHtml implements ViewInterface
{
  /**
   * XML head declaration
   *
   * @var string
   * @RegistryMapValue
   */
  public $xmlHead = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';

  /**
   * Document title
   *
   * @var string
   * @RegistryMapValue
   */
  public $title;

  /**
   *
   * @var boolean
   * @RegistryMapValue
   */
  public $packageScripts = false;

  /**
   *
   * @var boolean
   * @RegistryMapValue
   */
  public $packageStyles = false;

  /**
   * Javascript paths and content
   *
   * @var array
   * @RegistryMapValue
   */
  public $scripts;

  /**
   * Inline Javascript code to include in header
   *
   * @var string
   * @RegistryMapValue
   */
  public $inlineScript;

  /**
   * CSS paths and content
   *
   * @var array
   * @RegistryMapValue
   */
  public $css;

  /**
   * Array of attributes to <body>
   *
   * @var array
   * @RegistryMapValue
   */
  public $bodyAttributes = array();

  /**
   * Content of <body> element
   *
   * @var string
   * @RegistryMapValue
   */
  public $bodyInnerHtml;

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

  protected $firstScript;

  public function build()
  {
    return $this->buildXmlHead()
      . $this->buildRootNode();
  }

  public function buildXmlHead()
  {
    return trim($this->xmlHead);
  }

  public function buildRootNode()
  {
    return $this->tag('html',
                      array('xmlns' => 'http://www.w3.org/1999/xhtml'),
                      $this->buildXHtmlHead()
                      . $this->buildXHtmlBody());
  }

  /**
   * XHtml <head>
   */
  public function buildXHtmlHead()
  {
    return $this->tag('head', null,
                      $this->buildTitle()
                      . $this->buildMetas()
                      . $this->buildHeadLinks()
                      . $this->buildCss()
                      . $this->buildScripts()
                      );
  }

  public function buildMetas()
  {
    return $this->tag('meta', array('content' => 'text/html; charset=utf-8', 'http-equiv' => 'content-type'));
  }

  /**
   * XHtml <link> elements in <head>
   */
  public function buildHeadLinks()
  {
    return $this->tag('link', array('rel' => 'shortcut icon',
                                    'href' => '/favicon.ico'));
  }

  /**
   * XHtml <title>
   */
  public function buildTitle()
  {
    return $this->tag('title', null, $this->title);
  }

  public function buildScripts()
  {
    //$pScripts = $this->prepareScripts();
    $scripts = array();
    foreach ((array) $this->scripts as $path) {
      if (!$path) {
        continue;
      }
      $attrs = array();
      if (is_array($path)) {
        if (isset($path['async']) && $path['async']) {
          $attrs['async'] = 'true';
        }
        $path = $path['src'] ?: $path['content'];
      }
      $content = '';
      try {
        if (preg_match('/^(https?:\/\/|\/[^*])/', $path) // RE writing not finished
            /*strpos($path, 'http://') === 0 ||
             strpos($path, '/') === 0*/
            /*substr($path, strlen($path) - 3) === '.js'*/) {
          if ($this->packageScripts && ($code = $this->fetchResource($path))) {
            $content = $code;
          } else {
            $attrs['src'] = $path;
          }
        } else {
          $content = $path;
        }
      }
      catch (\Exception $e) {
        $scripts[] = "\n".'<!-- '.$e->getMessage().'-->';
        $content = $path;
      }
      $scripts[] = $this->tag('script',
                              array_merge($attrs, array('type' => 'text/javascript')), $content);
    }
    if (is_string($this->inlineScript)) {
      $code = trim($this->inlineScript);
      if (strlen($code)) {
        $scripts[] = $this->tag('script',
                                array('type' => 'text/javascript'), $code);
      }
    }
    return implode($scripts);
  }

  protected function fetchResource($path)
  {
    $filter = function($c) {
      //return "<![CDATA[\n"
      return strtr($c, array('<' => '&lt;'));
      //. $c
      //. "\n]]>";
    };
    if (strpos($path, 'http://') === 0) {
      return $filter(file_get_contents($path));
    } elseif (strpos($path, '/') === 0) {
      $file =
        FileSystem::makePath(dirname(dirname(dirname(dirname(dirname(dirname(dirname(__DIR__))))))),
                             'site/public', substr($path, 1));
      if (file_exists($file)) {
        return $filter(file_get_contents($file));
      } else {
        throw new \Exception('did not find '.$file);
      }
    } else {
      return false;
    }
  }

  /*public function prepareScripts()
  {
    $scripts = array():
    foreach ((array) $this->scripts as $script) {
      if ($this->packageScripts) {
        $scripts = array();

      } else {
      }
    }
    if (is_string($this->inlineScript)) {
      $code = trim($this->inlineScript);
      if (strlen($code)) {
        $scripts[] = $code;
      }
    }
    return $scripts;
    }*/

  public function buildCss()
  {
    $css = array();
    foreach ((array) $this->css as $path) {
      if (!$path) {
        continue;
      }
      $attrs = array();
      $content = '';
      if (strpos($path, 'http://') === 0 ||
          substr($path, strlen($path) - 4) === '.css') {
        $css[] = $this->tag('link', array(
                                          'rel' => 'stylesheet',
                                          'type' => 'text/css',
                                          'href' => $path));
      } else {
        $css[] = $this->tag('style', array(
                                           'type' => 'text/css'), $path);
      }
    }
    return implode($css);
  }

  /**
   * Add instruction like "window.foo='value';" to inline script
   *
   * Value is serialized through json_encode.
   *
   * @param string $name
   * @param mixed $value
   * @RegistryMapForEach(key="scriptAffectations",passName=true)
   */
  public function writeScriptAffectation($name, $value)
  {
    $code = $name . ' = ' . json_encode($value) . ";\n";
    $this->inlineScript = (string)$this->inlineScript . $code;
  }

  /**
   * Add inline script
   *
   * @param string $code
   * @RegistryMapForEach(key="inlineScripts")
   */
  public function writeInlineScript($code)
  {
    $this->inlineScript = (string)$this->inlineScript . $code . "\n";
  }

  public function buildXHtmlBody()
  {
    return $this->tag('body', $this->bodyAttributes, $this->bodyInnerHtml);
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
