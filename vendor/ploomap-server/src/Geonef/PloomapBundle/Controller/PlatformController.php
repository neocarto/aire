<?php
namespace Geonef\PloomapBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use FOS\UserBundle\Model\UserInterface;

use Funkiton\InjectorBundle\Annotation\Inject;

/**
 * Handle various requests about maps
 *
 * @Inject("doctrine.odm.mongodb.documentManager", name="dm")
 * @Inject("session", name="session")
 *
 * @package Ploomap
 */
class PlatformController extends Controller
{
  protected $workspaceViewPath = 'views.platform';
  protected $user;

  /**
   * Handle root workspace route
   */
  public function workspaceAction()
  {
    $view = $this->getWorkspaceView();
    if (!$view) {
      throw new \Exception('not found in registry: '.$path);
    }
    if ($view instanceof ContainerAwareInterface) {
      $view->setContainer($this->container);
    }
    $this->configureView($view);

    return new Response($view->build());
  }

  protected function getUser()
  {
    if (!$this->user) {
      $this->user = $this->container->get('security.context')->getToken()->getUser();
    }

    return $this->user;
  }

  protected function isUserLogged()
  {
    $user = $this->getUser();

    return is_object($user) && $user instanceof UserInterface;
  }

  protected function getWorkspaceView()
  {
    $registry = $this->container->get('zig.registry');
    $view = $registry->getObject($this->workspaceViewPath);

    return $view;
  }

  protected function configureView($view)
  {
    $view->logged = $this->isUserLogged();
    $view->user = $this->getUser();
  }

}
