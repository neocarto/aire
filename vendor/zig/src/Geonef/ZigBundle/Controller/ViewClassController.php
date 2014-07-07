<?php
namespace Geonef\ZigBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

class ViewClassController extends Controller
{

  public function renderAction($path)
  {
    $registry = $this->container->get('zig.registry');
    $view = $registry->getObject($path);
    if (!$view) {
      throw new \Exception('invalid path: '.$path);
    }
    if ($view instanceof ContainerAwareInterface) {
      $view->setContainer($this->container);
    }
    return new Response($view->build());
  }

}
