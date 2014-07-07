<?php

namespace Geonef\Zig\Registry\Transform;

use \X\Geonef\Zig\Registry\Transform\Transformation;
use \X\Geonef\Zig\Registry\Node\Node;

/**
 * UNUSED - R&D work in progress
 *
 * @author okapi
 *
 */
class Inherits implements Transformation
{
	/**
	 * Node for operation
	 *
	 * @var Node
	 */
	protected $node;

	/**
	 * Path of file to include
	 *
	 * @var string
	 */
	protected $path;

	/**
	 * {@inheritdoc}
	 *
	 */
	public function setNode(Node $node)
	{
		$this->node = $node;
	}

	public function setValue($value)
	{
		$this->path = $value;
	}

	/**
	 * {@inheritdoc}
	 *
	 */
	public function apply()
	{
		$t = new \X\Geonef\Zig\Registry\Loader\YamlFile($this->path);

	}

}

