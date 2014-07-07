<?php

namespace Geonef\Zig\Registry;

use \Geonef\Zig\Registry\Base;

use \Doctrine\Common\Annotations\AnnotationReader,
  \Doctrine\Common\Cache\ArrayCache,
  \Geonef\Zig\Registry\Mapping,
  \Geonef\Zig\Registry\Registry,
  \ReflectionClass,
  \ReflectionMethod,
  \ReflectionProperty;

require_once __DIR__ . '/Mapping/ZigClass.php';

class Mapper
{
  const ANNOTATION_NS = 'Geonef\Zig\Registry\Mapping\\';

  /**
   * Get value from generic definition
   *
   * If $registryNode is not an array, it will probably be return unchanged.
   * (depends on the "type" attribute)
   *
   * @param array		$registryNode
   * @param array		$options
   */
  public static function getMappedValue($registryNode, $options = null)
  {
    $options = $options ?: array('type' => '', 'prefix' => '');
    switch (strtolower($options['type'])) {
    case 'string':	return strval($registryNode);
    case 'integer':	return intval($registryNode);
    case 'float':	return floatval($registryNode);
    case 'array':	return (array) $registryNode;
    case 'boolean':	return !!$registryNode;
    case 'object':	return static::getMappedObject($registryNode, $options);
    default:		return $registryNode;
    }
  }

  protected static function getMappedObject($registryNode, $options)
  {
    if (!is_array($registryNode)) {
      throw new \Exception('$registryNode must be an array');
    }
    if (isset($registryNode['class'])) {
      $class = $registryNode['class'];
    } else {
      $class = $options['defaultClass'];
    }
    $class = (isset($options['prefix']) ? $options['prefix'] : '')
      . $class;
    $reader = static::getAnnotationReader();
    $reflClass = new ReflectionClass($class);
    $constructor = $reader->getClassAnnotation
      ($reflClass, static::ANNOTATION_NS . 'RegistryMapConstructor');
    if ($constructor) {
      //$method = $constructor->method;
      $args = array();
      if (isset($options['passThis']) && $options['passThis'] &&
          isset($options['thisObject'])) {
        $args[] = $options['thisObject'];
      }
      foreach ($constructor->params as $mapValue) {
        $args[]  = $mapValue->getValue($registryNode);
      }
      //var_dump($args);exit;
      $object = call_user_func_array
        (array($class, $constructor->method), $args);
      //$reflMethod = $reflClass->getMethod($constructor->method);
      //$reflMethod->invoke(null, $args)
      //$p = $reflMethod->getPrototype();
      //var_dump($p);
    } else {
      if (isset($options['passThis']) && $options['passThis'] &&
          isset($options['thisObject'])) {
        $object = new $class($options['thisObject']);
      } else {
        $object = new $class();
      }
      //var_dump($class);
    }
    static::mapObject($registryNode, $object);
    return $object;
  }

  /**
   * Map registry structure to object
   *
   * If $object is null, create it from properties
   *
   * @param array		$registryNode
   * @param Object	$object
   */
  public static function mapObject($registryNode, $object = null, $debug = false)
  {
    if (is_string($registryNode)) {
      $registryNode = Registry::get($registryNode);
    }
    if (!$object) {
      return static::getMappedObject($registryNode, array());
    }
    $reader = static::getAnnotationReader();
    $class = new ReflectionClass($object);
    $classAnnotations = $reader->getClassAnnotations($class);
    if ($debug) var_dump($classAnnotations);
    foreach ($class->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
      $ann = $reader->getMethodAnnotations($method);
      //var_dump($ann);
      foreach ($ann as $mapping) {
        if ($mapping instanceof Mapping\MethodApply) {
          $mapping->methodApply($object, $registryNode, $method);
        }
      }
    }
    foreach ($class->getProperties(ReflectionProperty::IS_PUBLIC) as $property) {
      $ann = $reader->getPropertyAnnotations($property);
      //var_dump($ann);
      foreach ($ann as $mapping) {
        if ($mapping instanceof Mapping\PropertyApply) {
          $mapping->propertyApply($object, $registryNode, $property);
        }
      }
    }
  }

  /**
   * Instanciate Doctrine AnnotationReader object
   *
   * @return Doctrine\Common\Annotations\AnnotationReader
   */
  public static function getAnnotationReader()
  {
    static $_reader = null;
    if (!$_reader) {
      $_reader = new AnnotationReader(new ArrayCache);
      $_reader->setDefaultAnnotationNamespace(static::ANNOTATION_NS);
    }
    return $_reader;
  }

}
