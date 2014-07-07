<?php

namespace Geonef\PloomapBundle\Document\Map;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PloomapBundle\Document\Map as AbstractMap;
use Geonef\Ploomap\Util\Geo;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;

/**
 * Standalone map: does not depend on another map (versus ModelBased)
 *
 * @Document
 */
class Standalone extends AbstractMap
{
  const MODULE = 'Standalone';

  protected $outputFormats = array
    ('aggpng24' => array('driver' => 'AGG/PNG',
                         'imagemode' => 'RGB',
                         'mimetype' => 'image/png',
                         'extension' => 'png'),
     'aggjpeg' => array('driver' => 'AGG/JPEG',
                        'imagemode' => 'RGB',
                        'mimetype' => 'image/jpeg',
                        'extension' => 'jpg'),
     'gdtiff' => array('driver' => 'GDAL/GTiff',
                       'imagemode' => 'RGB',
                       'mimetype' => 'image/tiff',
                       'extension' => 'tif'),
     'gdgif' => array('driver' => 'GD/GIF',
                      'imagemode' => 'PC256',
                      'mimetype' => 'image/gif',
                      'extension' => 'gif'),
     'csvzip' => array('driver' => 'OGR/CSV',
                       //'mimetype' => 'text/csv',
                       'formatoption' => 'LCO:GEOMETRY=AS_WKT',
                       'formatoption' => 'STORAGE=memory',
                       //'formatoption' => 'FORM=simple',
                       'formatoption' => 'FORM=zip',
                       'formatoption' => 'FILENAME=data_csv.zip'),
     'shapezip' => array('driver' => 'OGR/ESRI Shapefile',
                         'formatoption' => 'STORAGE=memory',
                         'formatoption' => 'FORM=zip',
                         'formatoption' => 'FILENAME=data_zip.zip'),
    /* 'kml' => array('driver' => 'KML', */
    /*                'mimetype' => 'application/vnd.google-earth.kml+xml', */
    /*                'imagemode' => 'RGB', */
    /*                'extension' => 'kml', */
    /*                'formatoption' => 'ATTACHMENT=data.kml', */
    /*                'formatoption' => 'maxfeaturestodraw=10000'), */
    /* 'kmz' => array('driver' => 'KML', */
    /*                'mimetype' => 'application/vnd.google-earth.kmz', */
    /*                'imagemode' => 'RGB', */
    /*                'extension' => 'kmz', */
    /*                'formatoption' => 'ATTACHMENT=data.kmz', */
     /*                'formatoption' => 'maxfeaturestodraw=10000'), */
     'svg' => array('driver' => 'CAIRO/SVG',
                    'mimetype' => 'image/svg+xml',
                    'formatoption' => 'FULL_RESOLUTION=TRUE',
                    'extension' => 'svg',
                    'imagemode' => 'RGB'),
     'svgz' => array('driver' => 'CAIRO/SVG',
                     'mimetype' => 'image/svg+xml',
                     'formatoption' => 'FULL_RESOLUTION=TRUE',
                     'formatoption' => 'COMPRESSED_OUTPUT=TRUE',
                     'extension' => 'svgz'),
     );

  /**
   * @MongoString
   */
  public $spatialRef;

  /**
   * Map background color
   *
   * @MongoString
   */
  public $backgroundColor;

  /**
   * Legend free content
   *
   * @MongoString
   */
  public $legendContent;


  /**
   * Check validity of this map properties
   *
   * This tests properties values as well as whether all checks
   * whose success garanties a build success
   * (ex: datasource as valid, can be opened...)
   *
   * @param $container ContainerInterface
   * @param $errors    array
   * @return boolean    Whether the map properties are valid
   */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    $state &= $this->checkCond(strlen($this->spatialRef) > 0,
                               'spatialRef', 'missing', $errors);
    $state &= $this->checkCond(preg_match('/^EPSG:[0-9]+$/', $this->spatialRef),
                               'spatialRef', 'invalid', $errors);
    $state &= $this->checkColor($this->backgroundColor,
                                'backgroundColor', $errors);
    return $state;
  }

  protected function getNewMapObj()
  {
    $mapStrContent = array('MAP');
    foreach ($this->outputFormats as $name => $format) {
      $mapStrContent[] = 'OUTPUTFORMAT';
      $mapStrContent[] = 'NAME '.$name;
      foreach ($format as $prop => $val) {
        $mapStrContent[] = strtoupper($prop).' "'.$val.'"';
      }
      $mapStrContent[] = 'END';
    }
    $mapStrContent[] = 'END';
    $msMap = ms_newMapObjFromString(implode("\n", $mapStrContent));
    //$msMap = new \mapObj(null);
    return $msMap;
  }

  protected function configureMap(\mapObj $msMap,
                                  ContainerInterface $container)
  {
    $ref = new \OGRSpatialReference();
    $ref->SetFromUserInput($this->spatialRef);
    //$msMap->setProjection($ref->exportToProj4());
    $msMap->setProjection($this->spatialRef/*, MS_TRUE*/);
    Geo::setMsColor($msMap->imagecolor, $this->backgroundColor);
    parent::configureMap($msMap, $container);
  }

  /**
   * Return legend data for this map
   *
   * @param $container ContainerInterface
   * @return string
   */
  public function buildLegendData(ContainerInterface $container/*,
                              $format = 'html',
                              $resolution = null*/)
  {
    $data = parent::buildLegendData($container);
    $data['widgetClass'] = 'geonef.ploomap.legend.Simple';
    $data['value'] = array('content' => $this->legendContent);
    return $data;
  }

}
