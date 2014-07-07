<?php

namespace Geonef\ZigBundle\Api;

use Geonef\Zig\Api\AbstractModule;

class Multiplexer extends AbstractModule
{
  public function execute()
  {
    $manager = $this->container->get('zig.api.manager');
    foreach ($this->request as $name => &$subRequest) {
      $req = $manager->newRequest($subRequest);
      $req->execute();
      $this->response[$name] = $req->getResponse();
    }
  }
}
