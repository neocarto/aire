<?php

namespace Geonef\Zig\Action\Response;

use \X\Geonef\Zig\Action\Response\StaticResponse as XStaticResponse;

class Exception extends XStaticResponse
{
	public function __construct(\Exception $e)
	{
		parent::__construct();
		$this->mergeArray(static::serializeException($e));
	}

	public static function serializeException(\Exception $e)
	{
		$array = array();
		foreach (array('message', 'code', 'file', 'line', 'trace', 'previous')
					as $param) {
			$method = 'get' . ucfirst($param);
			$array[$param] = $e->$method();
			if ($array[$param] instanceof Exception) {
				$array[$param] = static::serializeException($array[$param]);
			}
		}
		return $array;
	}
}
