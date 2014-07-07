<?php

namespace Geonef\Zig\Action\Service;

use \X\Geonef\Zig\Action\AbstractAction;
use \Exception;

class HttpStatic extends AbstractAction
{
	public function execute()
	{
		//phpinfo();
		if (!isset($this->request['path'])) {
			throw new Exception('missing parameter "path"');
		}
		//var_dump($this->request['path']);
		if (!is_readable($this->request['path'])) {
			throw new Exception('path is not readable');
		}
		if (is_dir($this->request['path'])) {
			throw new Exception('path is a directory');
		}
		readfile($this->request['path']);
	}
}
