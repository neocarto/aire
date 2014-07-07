<?php

namespace Geonef\Zig\Action\Response;
use \X\Geonef\Zig\Common\Container\Hash;

class StaticResponse extends Hash implements Response
{
	protected $body = '';

	public function __construct()
	{
		$this->initialize();
	}

	protected function initialize() {}

	/*public function getBody()
	{
		return $this->body;
	}

	public function setBody()
	{
		throw new \Exception('setBody');
		return $this->body;
	}*/

	public function start()
	{
		$this->body = '';
	}

	public function end()
	{
		echo $this->body;
	}

	public function write($txt)
	{
		$this->body .= $txt;
	}
}
