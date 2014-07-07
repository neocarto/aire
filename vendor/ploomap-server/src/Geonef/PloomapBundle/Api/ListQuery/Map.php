<?php

namespace Geonef\PloomapBundle\Api\ListQuery;

use Geonef\ZigBundle\Api\ListQuery\AbstractDocumentQuery;
use Geonef\Ploomap\Util\Geo;
use Geonef\PloomapBundle\Document\Map as MapDoc;
use mapObj;

class Map extends AbstractDocumentQuery
{
  protected $documentClass = 'Geonef\PloomapBundle\Document\Map';

  protected $fieldTranslation = array('name' => 'title');

  protected $titleProp = 'title';

  protected function beforePersist($map)
  {
    $map->lastEditedAt = new \DateTime();
  }

  protected function composeRowStructure($document)
  {
    $struct = parent::composeRowStructure($document);
    $struct['mapCollection'] = $document->mapCollection ?
      $document->mapCollection->getTitle() : null;
    return $struct;
  }

  public function getFilterForIdAction()
  {
    $id = $this->request['id'];
    $doc = $this->find($id);
    $struct = $this->composeRowStructure($doc);
    $this->response['document'] = $struct;
    $filter = array('name' => array('op' => 'contains',
                                    'value' => $doc->title),
                    'module' => array('op' => 'in',
                                      'value' => array($struct['module'])));
    if ($doc->mapCollection) {
      $filter['mapCollection'] = array('op' => 'ref',
                                'value' => $doc->mapCollection->uuid);
    }
    $this->response['filter'] = $filter;
  }

  public function getMapStringAction()
  {
    $map = $this->find($this->request['uuid']);
    $this->response['mapString'] = $map->getMapString($this->container);
  }

  public function computeExtentAction()
  {
    $map = $this->arrayToModel($this->request['map']);
    $this->response['extent'] = $map->computeExtent($this->container);
  }

  public function getWmsInfoAction()
  {
    $doc = $this->find($this->request['uuid']);
    /* $url = $msMap->web->metadata->get('wms_onlineresource'); */
    /* if (strpos(substr($url, -1, 1), '?&') === false) { */
    /*   $url .= '?'; */
    /* } */
    //$url = $msMap->web->metadata->get('wms_onlineresource');
    $msMap = $doc->build($this->container);
    $url = $msMap->getMetaData('wms_onlineresource');
    $this->response['uuid'] = $doc->uuid;
    $this->response['url'] = $url;
    $this->response['urlGetCapabilitiesWms'] =
      $url .'SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities';
    $this->response['urlGetCapabilitiesWfs'] =
      $url .'SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities';
    $this->response['srs'] = array($doc->getMapProjection($this->container));
      //explode(' ', $msMap->getMetaData('wms_srs'));
    $this->response['extent'] = $doc->getExtent($this->container);
    $this->response['layers'] = $doc->getLayerNames($this->container);
    $this->response['enabledLayers'] =
      $doc->getLayerNames($this->container, null, true);
    foreach ($this->response['layers'] as $name) {
      $msLayer = $msMap->getLayerByName($name);
      $data = $msLayer->data;
      if (strstr(strtolower($data), 'select') !== false) {
        $this->response['sql'][$name] = $data;
      }
    }
    $this->response['exports'] = $this->getExportUrls($doc, $msMap);
  }

  protected function getExportUrls(MapDoc $map, mapObj $msMap)
  {
    $layers = $map->getLayerNames($this->container, $msMap, true);
    $url = $msMap->getMetaData('wms_onlineresource');
    $common = array('WIDTH' => 500, 'HEIGHT' => 500);
    return array
      ('PNG' => $map->getWmsMapUrl($this->container,
                                   array_merge(array('FORMAT' => 'image/png'), $common)),
       'JPEG' => $map->getWmsMapUrl($this->container,
                                    array_merge(array('FORMAT' => 'image/jpeg'), $common)),
       'GIF' => $map->getWmsMapUrl($this->container,
                                   array_merge(array('FORMAT' => 'image/gif'), $common)),
       'GeoTIFF' => $map->getWmsMapUrl($this->container,
                                       array_merge(array('FORMAT' => 'image/tiff'), $common)),
       'SVG' => $map->getWmsMapUrl($this->container,
                                   array_merge(array('FORMAT' => 'image/svg+xml'), $common)),
       'KML' => $map->getWmsMapUrl($this->container,
                                   array('FORMAT' => 'application/vnd.google-earth.kml+xml'), $common),
       'CSV' => $map->getWfsUrl($this->container,
                                array('OUTPUTFORMAT' => 'text/csv')),
       'Shapefile' => $map->getWfsUrl($this->container,
                                      array('OUTPUTFORMAT' => 'shapezip')),
       'Carte AIRE SVG' => $this->container->get('router')
       ->generate('geonef_ploomap_map_svg', array('id' => $map->getId()))
       );
    //$url . 'SERVICE=WMS'
  }

  public function getLegendDataAction()
  {
    $doc = $this->find($this->request['uuid']);
    $this->response += $doc->getLegendData($this->container);
  }

  public function clearBuildAction()
  {
    foreach ($this->request['uuids'] as $uuid) {
      $map = $this->find($uuid, true);
      $map->clearInfoCache($this->container);
      $this->documentManager->flush();
    }
    $this->response['status'] = 'ok';
  }

}
