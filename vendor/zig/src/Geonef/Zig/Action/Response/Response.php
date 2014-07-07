<?php

namespace Geonef\Zig\Action\Response;

interface Response extends \ArrayAccess
{
	/*public function getBody();

	public function setBody();*/

	public function start();

	public function end();

	public function write($content);
}
