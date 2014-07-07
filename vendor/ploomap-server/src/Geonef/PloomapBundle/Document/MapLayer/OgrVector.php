<?php

namespace Geonef\PloomapBundle\Document\MapLayer;

use Geonef\PloomapBundle\Document\MapLayer as BaseLayer;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\Zig\Util\Dev;
use Geonef\Ploomap\util\Geo;
use mapObj as MsMap;
use layerObj as MsLayer;

use Doctrine\ODM\MongoDB\Mapping\Annotations\EmbeddedDocument;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Hash;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Boolean;
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceOne;

/**
 * Map layer taking data from OGR layer
 *
 * @EmbeddedDocument
 */
class OgrVector extends BaseLayer
{
  /**
   * @MongoString
   */
  public $name;

  /**
   * Datasource layer to take the geometry & data from
   *
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\OgrLayer")
   */
  public $ogrLayer;

  /**
   * @MongoString
   */
  public $spatialRef;

  /**
   * @MongoString
   */
  public $geometryType;

  /**
   * @Hash
   */
  public $style;

  /**
   * @Boolean
   */
  public $forceOgr = true;


  public function getName()
  {
    return $this->name;
  }

  /**
   * Check validity of document properties
   *
   * @param $container ContainerInterface
   * @param $errors    array
   * @return boolean    Whether the map properties are valid
   */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    foreach (array('name', 'spatialRef', 'geometryType') as $prop) {
      $state &= $this->checkCond(strlen($this->$prop) > 0,
                                 $prop, 'missing', $errors);
    }
    $state &= $this->checkCond(preg_match('/^EPSG:[0-9]+$/', $this->spatialRef),
                               'spatialRef', 'invalid', $errors);
    $errs = array();
    $state &= $this->checkCond($this->ogrLayer,
                          'ogrLayer', 'missing', $errors) &&
      $this->checkCond($this->ogrLayer->getId(),
                       'ogrLayer', 'invalid', $errors);
    return $state;
  }

  protected function doBuild(MsMap $msMap, ContainerInterface $container)
  {
    $msLayer = ms_newLayerObj($msMap);
    $this->configureMsLayer($msLayer, $container);
    $this->configureStyle($msLayer, $container);
    return $msLayer;
  }

  protected function configureMsLayer(MsLayer $msLayer, ContainerInterface $container)
  {
    if (!$this->ogrLayer) {
      throw new \Exception('ogrLayer not defined for mapLayer:'.$this->uuid);
    }
    $msLayer->set('name', $this->name);
    $types = array('polygon' => MS_LAYER_POLYGON,
                   'line' => MS_LAYER_LINE,
                   'point' => MS_LAYER_POINT,
                   'circle' => MS_LAYER_CIRCLE);
    if (!isset($types[$this->geometryType])) {
      throw new \Exception('invalid geometryType for layer '.$this->uuid);
    }
    $msLayer->set('type', $types[$this->geometryType]);
    //$msLayer->setConnectionType(MS_OGR);
    if (strlen($this->spatialRef) > 0) {
      $msLayer->setProjection($this->spatialRef);
    }
    //$ogrSource = $this->getOgrSource($container);
    if (!$this->ogrLayer) {
      throw new \Exception('ogrLayer not defined for mapLayer: '.$this->uuid);
    }
    //$dataSource = $this->ogrLayer->getDataSource($container);
    Geo::setLayerConnection($container, $msLayer, $this->ogrLayer, $this->forceOgr);
    //$msLayer->set('connection', $dataSource->getSourcePath($container));
    //$msLayer->set('data', $this->ogrLayer->getName());
    parent::configureMsLayer($msLayer, $container);
  }

  protected function configureStyle(MsLayer $msLayer, ContainerInterface $container)
  {
    //var_dump($this->style);exit;
    $msClass = ms_newClassObj($msLayer);
    $msStyle = ms_newStyleObj($msClass);
    if (isset($this->style['width'])) {
      $msStyle->set('width', floatval($this->style['width']));
    }
    if (isset($this->style['outline'])) {
      //$msStyle->set('outline', $this->style['outline']);
      Geo::setMsColor($msStyle->outlinecolor, $this->style['outline']);
    }
    if (isset($this->style['background'])) {
      //$msStyle->set('background', $this->style['background']);
      Geo::setMsColor($msStyle->color, $this->style['background']);
    }
    $msLayer->set('sizeunits', MS_PIXELS);
  }

  /*protected function getOgrSource(ContainerInterface $container)
  {
    $dm = $container->getDoctrine_Odm_Mongodb_DocumentManagerService();
    $class = 'Geonef\Ploomap\\Bundle\\PloomapBundle\\Document\\OgrDataSource';
    $uuid = $this->ogrLayer['source']['uuid'];
    $doc = Dev::findDocument($class, $uuid, $dm);
    return $doc;
    }*/

}
