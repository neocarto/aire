<?php

namespace Geonef\Zig\Pattern;

interface Singleton
{
	/**
	 * Returns singleton instance object of this class.
	 *
	 * The class may use 'new self' or 'new static' depending on the
	 * strategy of inheritance.
	 *
	 * Every call to this static method should return the same object,
	 * that was created at the first call, then remembered.
	 *
	 * @return self
	 */
	public static function getInstance();
}
