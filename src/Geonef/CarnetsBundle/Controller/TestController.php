<?php

namespace CatapatateBundle\Controller;

use Symfony\Framework\WebBundle\Controller;
use Symfony\Components\DependencyInjection\Dumper\YamlDumper;
use Application\HurepoixBundle\Entities\Test;

class TestController extends Controller
{
  public function indexAction($name)
  {
    echo 'hehe!';
    return null;
    #return $this->render('HelloBundle:Hello:index', array('name' => $name));
  }

  public function testAction()
  {
    //return $this->render('WebBundle:Default:index');
    $response = $this->container->getResponseService();
    //$dumper = new YamlDumper($this->container);
    //$yaml = $dumper->dump();
    $out = 'hoooooooooooooo';
    //$em = $this->container->getDoctrine_ORM_DefaultEntityManagerService();
    $em = $this->container->getDoctrine_ORM_EntityManagerService();
    // $conf = $em->getConfiguration();
    // $cache = $conf->getMetadataCacheImpl();
    // $out .= '<br>'. get_class($cache);
    // $driver = $conf->getMetadataDriverImpl();
    // $out .= '<br>'. get_class($driver);
    // $proxyDir = $conf->getProxyDir();
    // $out .= '<br>'. $proxyDir;
    // $dc = $this->container->getParameter('doctrine.dbal.password');
    // $out .= '<br>'. $dc.'!!';
    // //$b = $em->createQueryBuilder();
    // //$b->from('Test');
    // $test = new Test;
    // $test->def('aaaaaa');
    // $em->persist($test);
    // $em->flush();
    // $out .= '<br>' . $test->getId();
    $qb = $em->createQueryBuilder();
    $qb
      ->select('t')
      ->from('Application\HurepoixBundle\Entities\Test', 't')
      ->where("t.testField = 'hehe'")
      /*->setParameters(array('hehe'))*/;
    $sql = $qb->getQuery()->getSql();
    $out .= '<br>' . $sql;
    $dd = array();
    //$it = $qb->getQuery()->iterate(array('hehe'));
    $it = $qb->getQuery()->execute();
    foreach ($it as $tt) {
      $dd[] = $tt->getId();
    }
    $out .= '<br>' . implode(' | ', $dd);
    $t = $em
      ->getRepository('Application\HurepoixBundle\Entities\Test')
      ->findOneBy(array('id' => 5));
    $out .= '<br>' . $t->fetch();
    $response->setContent($out);
    return $response;
  }
}
