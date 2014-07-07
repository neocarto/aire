<?php

namespace Geonef\Zig\Action\Request;

interface Request extends \ArrayAccess
{
	public function getBody();
}
