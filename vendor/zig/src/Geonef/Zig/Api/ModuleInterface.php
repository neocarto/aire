<?php

namespace Geonef\Zig\Api;

interface ModuleInterface
{
  /**
   * Set request structure, for later execution
   *
   * @param array $request
   */
  public function setRequest($request);

  /**
   * Return response (after execute() has been called)
   *
   * @return array
   */
  public function getResponse();

  /**
   * Execute request
   */
  public function execute();

}
