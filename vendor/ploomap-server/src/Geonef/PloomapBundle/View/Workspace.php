<?php

namespace Geonef\PloomapBundle\View;

use Geonef\Zig\View\Document\Html;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

class Workspace extends Html implements ContainerAwareInterface
{
  /**
   * @RegistryMapValue
   */
  public $currentApp;

  /**
   * @RegistryMapValue(key="widgets")
   */
  public $workspaceWidgets;

  /**
   * @RegistryMapValue(key="settings")
   */
  public $workspaceSettings;

  /**
   * @var boolean
   */
  public $logged;

  /**
   * @var FOS\UserBundle\Model\UserInterface
   */
  public $user;

  protected $topBarApps = array(
       'carto' => array('label' => "Carto",
                        'title' => "Portail cartographique",
                        'url' => 'http://carto.geonef.fr/'),
       /* 'carnets' => array('label' => "Carnets", */
       /*                    'title' => "Carnets de Voyage...", */
       /*                    'url' => 'http://carnets.geonef.fr/'), */
       'blog' => array('label' => 'Blog',
                       'title' => "Blog Geonef",
                       'url' => 'http://www.geonef.fr/blog'),
       'projects' => array('label' => "Projets",
                           'title' => "Projets de Geonef",
                           'url' => 'http://www.geonef.fr/projets'));
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
    $data = array();
    $this->buildData($data);
    $this->writeScriptAffectation('workspaceData', $data);
    return parent::buildScripts();
  }

  protected function buildData(/*array*/ &$data)
  {
    $data['widgets'] = $this->workspaceWidgets;
    $data['settings'] = $this->workspaceSettings;
    $data['user'] = is_object($this->user) ?
      $this->user->exportJsInfo() : null;
  }

  public function buildXHtmlBody()
  {
    $attrs = $this->bodyAttributes;
    $attrs['class'] .= ' '.($this->logged ? 'logged' : 'anonymous');
    return $this->tag('body', $attrs,
                      $this->buildBodyContent());
  }

  protected function buildBodyContent()
  {
    return $this->tag('div', array('id' => 'cont'),
                      $this->buildTopBar() .
                      $this->buildMain());
  }

  protected function buildTopBar()
  {
    $sep = $this->tag('span', array('class' => 'sep'), '|');
    $html = array();
    $html[] = $this->tag('a', array('href' => 'http://www.geonef.fr/','class'=>'logo'),
                         $this->tag('img', array('src' => '/image/geonef_30.png')));

    $apps = array();
    foreach ($this->topBarApps as $name => $app) {
      $apps[] = $name == $this->currentApp ?
        $this->tag('span', array('class' => 'toplink'), $app['label']) :
        $this->tag('a', array('href' => $app['url'],
                              'title' => $app['title'],
                              'class' => 'toplink'), $app['label']);
    }
    $html[] = implode($sep, $apps);
    /* $html[] = $this->tag('span', array('class' => 'toplink'), "Carto"); */
    /* $html[] = $sep; */
    /* $html[] = $this->tag('a', array('href' => 'http://www.geonef.fr/blog', */
    /*                                 'title' => "Blog Geonef", */
    /*                                 'class' => 'toplink'), "Blog"); */
    /* $html[] = $sep; */
    /* $html[] = $this->tag('a', array('href' => 'http://projects.geonef.fr/', */
    /*                                 'title' => "Projets Geonef", */
    /*                                 'class' => 'toplink'), "Projets"); */

    //$html[] = $this->tag('span', array('class' => 'loading'), "Chargement...");
    return $this->tag('div', array('id' => 'top'), implode($html));
  }

  protected function buildMain()
  {
    return $this->tag('div', array('id' => 'main'),
                      $this->buildPanel() .
                      $this->buildDisplay());
  }

  protected function buildPanel()
  {
    $html = array();
    $html[] = $this->tag('span', array(), "");
    return $this->tag('div', array('id' => 'panel'), implode($html));
  }

  protected function buildDisplay()
  {
    $html = array();
    return $this->tag('div', array('id' => 'display'), implode($html));
  }

}
