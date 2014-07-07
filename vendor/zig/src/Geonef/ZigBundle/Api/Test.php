<?php

namespace Geonef\ZigBundle\Api;

use Geonef\Zig\Api\AbstractModule;

class Test extends AbstractModule
{
  public function execute()
  {
    $this->response['test'] = 42;
  }
}
