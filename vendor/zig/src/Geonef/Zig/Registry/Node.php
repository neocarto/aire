<?php

namespace Geonef\Zig\Registry;

use \Traversable;
use \ArrayAccess;

/**
 * Interface for registry nodes, implemented by all registry "containers"
 *
 * UNUSED - R&D work in progress
 *
 * @author okapi
 */
interface Node extends Traversable, ArrayAccess, Countable
{
}
