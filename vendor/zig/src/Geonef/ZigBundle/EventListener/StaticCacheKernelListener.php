<?php

namespace Geonef\ZigBundle\EventListener;

//use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Geonef\ZigBundle\Service\StaticCacheManager;
use Geonef\ZigBundle\Exception;

/**
 *
 *
 */
class StaticCacheKernelListener
{
  /**
   * @var StaticCacheManager
   */
  protected $manager;


  public function __construct(StaticCacheManager $manager)
  {
    $this->manager = $manager;
  }

  /**
   * If static-cached, create the file with the given response
   *
   * @param FilterResponseEvent $event The notified event
   */
  public function onKernelResponse(FilterResponseEvent $event)
  {
    if (!$this->manager->isEnabled()) {
      return;
    }
    $request = $event->getRequest();
    $response = $event->getResponse();
    if (!$response->isSuccessful()) {
      return;
    }
    $routeName = $request->attributes->get('_route');
    if (!$this->manager->isRouteCached($routeName)) {
      return;
    }
    if (strlen($response->getContent()) > 0) {
      $this->manager->cacheResponse($routeName, $request->attributes->all(),
                                    $response->getContent());
    }
  }

}
