<?php

namespace Geonef\PloomapBundle\Document\MapLayer;

use Geonef\PloomapBundle\Document\MapLayer as BaseLayer;
use Symfony\Component\DependencyInjection\ContainerInterface;
use mapObj as MsMap;
use layerObj as MsLayer;

use Doctrine\ODM\MongoDB\Mapping\Annotations\EmbeddedDocument;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;

/**
 * @EmbeddedDocument
 */
class StaticLayer extends BaseLayer
{
  /**
   * @MongoString
   */
  public $name;

  /**
   * @MongoString
   */
  public $connectionType;

  /**
   * @MongoString
   */
  public $connection;

  /**
   * @MongoString
   */
  public $data;

  /**
   * @MongoString
   */
  public $geometryType;

  /**
   * @MongoString
   */
  public $spatialRef;

  protected function doBuild(MsMap $msMap, ContainerInterface $container)
  {
    $msLayer = new ms_newLayerObj($msMap);
    $this->configureMsLayer($msLayer);
    return $msLayer;
  }

  protected function configureMsLayer(MsLayer $msLayer, ContainerInterface $container)
  {
    $types = array('polygon' => MS_LAYER_POLYGON,
                   'line' => MS_LAYER_LINE,
                   'point' => MS_LAYER_POINT,
                   'circle' => MS_LAYER_CIRCLE);
    if (!isset($types[$this->geometryType])) {
      throw new \Exception('invalid geometryType for layer '.$this->uuid);
    }
    $cnt = array('local' => MS_SHAPEFILE,
                 'shapefile' => MS_SHAPEFILE,
                 'ogr' => MS_OGR,
                 'postgis' => MS_POSTGIS,
                 'wms' => MS_WMS);
    if (!isset($cnt[$this->connectionType])) {
      throw new \Exception('invalid connectionType for layer '.$this->uuid);
    }
    $msLayer->setConnectionType($cnt[$this->connectionType]);
    $msLayer->setProjection($this->spatialRef);
    $msLayer->set('connection', $this->connection);
    $msLayer->set('data', $this->data);
    $msLayer->set('type', $types[$this->geometryType]);
    parent::configureMsLayer($msLayer, $container);
  }

  protected function getName()
  {
    return $this->name;
  }

    // $config = $layerRec->getConfigArray();
    // $db = Doctrine::getTable('pmDatabase')->find($config['database']);
    // if (!$db)
    //   return null;
    // $layer = ms_newLayerObj($msMapObj);
    // $layer->set('name', $layerRec->get('name'));
    // if (isset($config['projection']) and $config['projection'] != '')
    //   $layer->setProjection($config['projection']);
    // if (isset($config['type']))
    //   switch ($config['type']) {
    //   case 'polygon':
    //     $layer->set('type', MS_LAYER_POLYGON);
    //     break;
    //   case 'line':
    //     $layer->set('type', MS_LAYER_LINE);
    //     break;
    //   case 'point':
    //     $layer->set('type', MS_LAYER_POINT);
    //     break;
    //   case 'circle':
    //     $layer->set('type', MS_LAYER_CIRCLE);
    //     break;
    //   default:
    //     $layer->set('type', MS_LAYER_POLYGON);
    //     /*      MS_LAYER_POINT, MS_LAYER_LINE, MS_LAYER_POLYGON,
    //      MS_LAYER_RASTER, MS_LAYER_ANNOTATION, MS_LAYER_QUERY,
    //      MS_LAYER_CIRCLE  MS_LAYER_TILEINDEX*/
    //   }
    // else
    //     $layer->set('type', MS_LAYER_POLYGON);
    // if (isset($config['sizeunits']))
    //   switch ($config['sizeunits']) {
    //   case 'pixels':
    //     $layer->set('sizeunits', MS_PIXELS);
    //     break;
    //   case 'feet':
    //     $layer->set('sizeunits', MS_FEET);
    //     break;
    //   case 'inches':
    //     $layer->set('sizeunits', MS_INCHES);
    //     break;
    //   case 'kilometers':
    //     $layer->set('sizeunits', MS_KILOMETERS);
    //     break;
    //   case 'meters':
    //     $layer->set('sizeunits', MS_METERS);
    //     break;
    //   case 'miles':
    //     $layer->set('sizeunits', MS_MILES);
    //     break;
    //   }
    // $query = str_replace("\n", ' ', $config['table_name']);
    // if (1) {
    //   $type = MS_POSTGIS;
    //   $con = 'host='.$db['host'].' port='.$db['port'].' user='
    //     .$db['user_'].' password='.$db['password'].' dbname='.$db['db'].'';
    //   $data = 'wkb_geometry from '.$query;
    // } else {
    //   $type = MS_OGR;
    //   $con = 'PG: user='.$db['user_'].' password='.$db['password']
    //     .' dbname='.$db['db'].'';
    //   $data = $query;
    // }
    // //    echo ("data:<br>".$data."<br><br>");
    // $layer->set('status', MS_ON);
    // $layer->set('connectiontype', $type);
    // $layer->set('connection', $con);
    // $layer->set('data', $data);
    // if (isset($config['transparency']))
    //   $layer->set('transparency', $config['transparency'] == 'alpha' ?
    //     	  MS_GD_ALPHA : intval($config['opacity']));


}
