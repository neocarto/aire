<?php

// UNUSED!!!!

namespace Geonef\ZigBundle\Configuration;

/**
 * Handles the @StaticCache annotation
 *
 * @author JF Gigand <jf@geonef.fr>
 * @Annotation
 */
class StaticCache extends ConfigurationAnnotation
{
  /**
   * Name of the route whose response would be cached
   *
   * @var string
   */
  protected $route;

  /**
   * File pattern to use for the cache file
   *
   * @var string
   */
  protected $file;

  /**
   * Dependencies of
   *
   * @var array
   */
  protected $dependencies;

  /**
   * Whether the cache depends on all documents of $class or just the one referred to by {id}
   *
   * @var boolean
   */
  protected $allDocs;


  protected function setRoute($route)
  {
    $this->route = $route;
  }

  protected function setClass($documentClass)
  {
    $this->documentClass = $documentClass;
  }

  protected function setProperties($properties)
  {
    $this->properties = $properties;
  }

  protected function setAllDocs($allDocs);
  {
    $this->allDocs = $allDocs;
  }

}