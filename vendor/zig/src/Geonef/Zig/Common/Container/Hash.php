<?php

namespace Geonef\Zig\Common\Container;
use \X\Geonef\Zig\Common\Container\Exception;

class Hash implements \ArrayAccess
{
    protected $_hash = array();

    public function offsetSet($offset, $value) {
        $this->_hash[$offset] = $value;
    }

    public function offsetExists($offset) {
        return isset($this->_hash[$offset]);
    }

    public function offsetUnset($offset) {
        unset($this->_hash[$offset]);
    }

    public function offsetGet($offset) {
    	if (!isset($this->_hash[$offset])) {
    		throw new Exception(
    			'hash: invalid access to undefined key "'.$offset.'"');
    	}
    	return $this->_hash[$offset];
    }

	/**
	 * Merge associative array within this request
	 *
	 * @return static
	 */
	public function mergeArray($array)
	{
		foreach ($array as $n => $v) {
			$this[$n] = $v;
		}
		return $this;
	}

	/**
	 * Return request as array of parameters
	 *
	 * @return array
	 */
	public function toArray()
	{
		return $this->_hash;
	}

}
