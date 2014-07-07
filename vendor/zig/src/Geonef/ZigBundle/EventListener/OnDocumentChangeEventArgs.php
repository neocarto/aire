<?php

namespace Geonef\ZigBundle\EventListener;

class OnDocumentChangeEventArgs extends DocumentEventArgs
{
  protected $changeSet;


  public function __construct($document, $changeSet)
  {
    parent::__construct($document);
    $this->changeSet = $changeSet;
  }

  /**
   * Return the changeSet
   *
   * @return array in the form of array(array(oldValue1, newValue1), array(oldValue2, newValue2), ...)
   */
  public function getChangeSet()
  {
    return $this->changeSet;
  }

  /**
   * Returns whether one of the given properties have been changed
   *
   * @param array
   * @return boolean
   */
  public function hasChanges($props)
  {
    foreach ($props as $prop) {
      if (isset($this->changeSet[$prop])) {

        return true;
      }
    }
    return false;
  }

  /**
   * returns whether changes exist for properties other than the one given
   *
   * @param array
   * @return boolean
   */
  public function hasChangesOtherThan($props)
  {
    foreach ($this->changeSet as $n => $vals) {
      if (in_array($n, $props)) { continue; }
      if ($vals[0] == $vals[1]) {
        continue;
      }
      return true;
    }
    return false;
  }

}
