<?php

namespace Geonef\Zig\Action\Response;
use \X\Geonef\Zig\Common\Container\Hash;

class Http extends Hash implements Response
{
	protected $status = 200;

	public function write($txt)
	{
		echo $txt;
	}

	public function start()
	{
		ob_start();
	}

	public function end()
	{
		header('Status: ' . $this->status . '');
		ob_end_flush();
	}

	public function reset()
	{
		ob_end_clean();
		ob_start();
	}

	public function setStatus($code)
	{
		$this->status = $code;
	}


}
