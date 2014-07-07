<?php

namespace Geonef\Zig\Action\Forward\Route;

use \Geonef\Zig\Action\Request\Request;
use \Geonef\Zig\Action\Response\Response;
use \X\Geonef\Zig\Action\Forward;

class FileSystem extends Forward\Route\Path
{
	/**
	 * Local FS base path
	 *
	 * @RegistryMapValue(key="fileSystemPath",type="string")
	 * @var string
	 */
	public $fsPath = null;

	protected function getMatchParams(Request $request)
	{
		//printf("%s\n%s\n", $request['scriptUrl'], $this->url);
		if (strpos($request['scriptUrl'], $this->path) !== 0) {
			return false;
		}
		$relative = substr($request['scriptUrl'], strlen($this->path));
		//printf("%s\n%s\n", $this->fsPath, $relative);
		$fsPath = $this->fsPath . $relative;
		if (!file_exists($fsPath)) {
			return false;
		}
		return array('path' => $fsPath);
	}

}
