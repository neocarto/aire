<?php

namespace Geonef\Zig\View\Document;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

class Workspace extends Html implements ContainerAwareInterface
{
  /**
   * @RegistryMapValue(key="widgets")
   */
  public $workspaceWidgets;

  /**
   * @RegistryMapValue(key="settings")
   */
  public $workspaceSettings;

  /**
   * @see ContainerAwareInterface::setContainer()
   */
  public function setContainer(ContainerInterface $container = null)
  {
    if (!$container) { return; }
    $this->container = $container;
    $this->locale = $container->get('session')->getLocale();
    $this->bodyAttributes['lang'] = $this->locale;
  }

  public function buildScripts()
  {
    $this->writeScriptAffectation('workspaceData',
                                  array('widgets' => $this->workspaceWidgets,
                                        'settings' => $this->workspaceSettings));
    return parent::buildScripts();
  }

  /**
   * @RegistryMapSetter(key="widgets")
   */
  /*public function setWorkspaceWidgets($widgets)
  {
    $this->workspaceWidgets
    }*/

  /**
   * @RegistryMapSetter(key="settings")
   */
  /*public function setWorkspaceSettings($settings)
  {
  }*/
}
