<?php

namespace Geonef\Zig\Framework\ZigBundle\Controller;

use Symfony\Framework\WebBundle\Controller\Controller;
use Symfony\Component\Yaml\Yaml;

class WorkspaceController extends Controller
{

  public function viewAction($key)
  {
    // TODO: find a better way than this hardcoded path
    /*$env = $this->container->getKernelService()->getEnvironment();
    $path = __DIR__ . '/../../../../../../../../site/config/workspaces_'.$env.'.yml';
    // and cache Yaml loading !!
    $data = Yaml::load($path);
    if (!is_array($data)) {
      throw new \Exception('couldn\'t load YAML file: '.$path);
      }*/
    $workspaceData = $data[$key];
    if (!isset($workspaceData[$key])) {
      throw new \Exception('invalid workspace key: '.$key);
    }
    $s = $this->container->getZig_RegistryService();
    $workspaces = $this->container->getParameter('zig.workspace.workspaces');
    return $this->render('ZigBundle:Workspace:view',
                         array('key' => $key, 'data' => $workspaceData,
                               'def' => $def));
  }

}
