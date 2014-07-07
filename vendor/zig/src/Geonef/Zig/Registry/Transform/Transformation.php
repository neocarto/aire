<?php

namespace Geonef\Zig\Registry\Transform;

/**
 *
 * UNUSED - R&D work in progress
 *
 * @author okapi
 *
 */
interface Transformation
{
	/**
	 * Define node to operate on
	 *
	 */
	public function setNode(Node $node);

	/**
	 * Apply the transformation
	 *
	 */
	public function apply();
}

