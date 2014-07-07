<?php

namespace Geonef\Zig\Action\Service;
use \Exception;

/**
 *
 * --------- NOT REALLY USED, ACTUALLY
 *
 */
class Api extends Forward\Router
{
	public function initialize()
	{
		parent::initialize();
		$this->request = new Request\Http;
		$this->response = new Response\Http;
		$this->mapSelf();
	}

	protected function mapSelf()
	{
		Mapper::mapObject('app.http.router', $this);
	}

	public function execute()
	{
		$this->response->start();
		try {
			parent::execute();
		}
		catch (Exception $e) {
			$this->response->reset();
			$this->response->setStatus(500);
			$this->response->write($e->__toString());
		}
		$this->response->end();
	}
}
