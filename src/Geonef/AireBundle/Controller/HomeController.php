<?php

namespace Geonef\AireBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Geonef\PloomapBundle\Document\MapCategory;
use Geonef\Zig\Util\FileSystem;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class HomeController extends Controller
{

  /**
   * Home page
   *
   * @Template("GeonefAireBundle:Home:home.twig.html")
   */
  public function homeAction()
  {
    $categories = MapCategory::getCategories($this->container);
    $env = $this->container->getParameter('kernel.environment');
    $path = FileSystem::makePath
      ($this->container->getParameter('kernel.root_dir'),
       'data', 'public', 'home.html');
    $content = file_exists($path) ? file_get_contents($path) :
      "fichier non trouvé : ".$path;
    return array('categories' => $categories,
                 'content' => $content,
                 'env' => $env);
  }

}
