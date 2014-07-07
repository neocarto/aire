<?php

namespace Geonef\Zig\Registry\Mapping;

use \ReflectionMethod;
use \ReflectionProperty;
use Doctrine\Common\Annotations\Annotation;
use \Geonef\Zig\Registry\Registry;
use \Geonef\Zig\Registry\Mapper;

class RegistryMapConstructor extends Annotation
{
  public $method = null;
}

interface MethodApply
{
  public function methodApply($object, $baseRegNode, ReflectionMethod $method);
}

interface PropertyApply
{
  public function propertyApply($object, $baseRegNode, ReflectionProperty $method);
}

class RegistryMapValue extends Annotation implements PropertyApply
{
  public $object;
  public $key;
  public $prefix = '';
  public $type = '';

  public function propertyApply($object, $baseRegNode, ReflectionProperty $property)
  {
    //printf("apply: %s\n", $property->getName());
    $this->object = $object;
    //var_dump($baseRegNode);
    $value = $this->getValue($baseRegNode, $property);
    if ($value !== null) {
      $propertyName = $property->getName();
      $object->$propertyName = $value;
    }
  }

  public function getValue($baseRegNode, ReflectionProperty $property = null)
  {
    $key = $this->key;
    if (!$key && $property) {
      $key = $property->getName();
    }
    if (isset($baseRegNode[$key])) {
      $value = $baseRegNode[$key];
      return $this->filterValue($value);
    }
    return null;
  }

  protected function filterValue($value)
  {
    return Mapper::getMappedValue($value, get_object_vars($this));
  }
}


class RegistryMapInstanciate extends Annotation implements PropertyApply
{
  public $class;
  public $passThis = false;

  public function propertyApply($object, $baseRegNode, ReflectionProperty $property)
  {
    //var_dump($this);exit;
    $class = $this->class ?: $this->value;
    $newObj = Mapper::getMappedValue
      (array('class' => $class),
       array('type' => 'object',
             'passThis' => $this->passThis,
             'thisObject' => $object));
    //var_dump($newObj);exit;
    $propertyName = $property->getName();
    $object->$propertyName = $newObj;
  }
}

/**
 * Set property value as a 1st class getter function
 *
 * @author okapi
 */
class RegistryMapListGetter extends Annotation implements PropertyApply
{
  public $key;
  public $prefix = '';
  public $type = '';

  public function propertyApply($object, $baseRegNode, ReflectionProperty $property)
  {
    //printf("apply: %s\n", $this->key);
    //var_dump($baseRegNode);
    $array = isset($baseRegNode[$this->key]) ?
      $baseRegNode[$this->key] : array();
    $self = $this;
    $getterFunc = function($name) use ($self, $array)
      {
        if (!isset($array[$name])) {
          return null;
        }
        return $self->filterValue($array[$name]);
      };
    $propertyName = $property->getName();
    $object->$propertyName = $getterFunc;
  }

  public function filterValue($value)
  {
    return Mapper::getMappedValue($value, get_object_vars($this));
  }
}

class RegistryMapSetter extends Annotation implements MethodApply
{
  public $key;
  public $type = '';
  public $passName = false;
  public $prefix = '';

  public function methodApply($object, $baseRegNode, ReflectionMethod $method)
  {
    $methodName = $method->getName();
    if (isset($baseRegNode[$this->key])) {
      $value = $baseRegNode[$this->key];
      $pValue = $this->filterValue($value);
      $object->$methodName($pValue);
    }
  }

  protected function filterValue($value)
  {
    return Mapper::getMappedValue($value, get_object_vars($this));
  }
}

class RegistryMapForEach extends Annotation implements MethodApply
{
  public $key;
  public $type = '';
  public $passName = false;
  public $prefix = '';

  public function methodApply($object, $baseRegNode, ReflectionMethod $method)
  {
    $methodName = $method->getName();
    if (isset($baseRegNode[$this->key])) {
      $node = $baseRegNode[$this->key];
      foreach ((array)$node as $name => $value) {
        $pValue = $this->filterValue($value);
        if ($this->passName) {
          $object->$methodName($name, $pValue);
        } else {
          $object->$methodName($pValue);
        }
      }
    }
  }

  protected function filterValue($value)
  {
    return Mapper::getMappedValue($value, get_object_vars($this));
  }
}

class LateMapping extends Annotation implements PropertyApply, MethodApply
{
  public $trigger;
  public $action;


  public function propertyApply($object, $baseRegNode, ReflectionProperty $property)
  {
    $this->commonApply($object, $baseRegNode, $property, 'propertyApply');
  }

  public function methodApply($object, $baseRegNode, ReflectionMethod $method)
  {
    $this->commonApply($object, $baseRegNode, $method, 'methodApply');
  }

  public function commonApply($object, $baseRegNode, $reflectionObj, $actionMethod)
  {
    $triggerMember = $this->trigger;
    //printf("late mapping on member %s\n", $triggerMember);
    $chainedTrigger = $object->$triggerMember ?: function() {};
    $action = $this->action;
    $trigger = function() use ($chainedTrigger, $action, $object,
                               $baseRegNode, $reflectionObj, $actionMethod) {
      //printf("late trigger\n");
      $chainedTrigger();
      $action->$actionMethod(
                             $object, $baseRegNode, $reflectionObj);
    };
    $object->$triggerMember = $trigger;
  }

}

