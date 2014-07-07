<?php

namespace Geonef\Zig\Framework\ZigBundle\Controller;

use Symfony\Framework\WebBundle\Controller\Controller;

class JsonController extends Controller
{

  public function processAction()
  {

    $response = $this->container->getResponseService();
    $response->setContent('haha!!');
    return $response;
  }

}
