<?php

namespace Geonef\Ploomap\Util;

use Geonef\PloomapBundle\Document\OgrLayer;
use Symfony\Component\DependencyInjection\ContainerInterface;
use mapObj as MsMap;
use rectObj as MsRect;
use layerObj as MsLayer;

class Geo
{

  /**
   * Convert MapScript RectObj object to array(xMin, yMin, xMax, Ymax)
   *
   * @return array
   */
  public static function msRectToExtent(MsRect $msRect)
  {
    return array($msRect->minx, $msRect->miny, $msRect->maxx, $msRect->maxy);
  }

  public static function extentToMsRect($extent, MsRect $msRect = null)
  {
    static $props = array('minx', 'miny', 'maxx', 'maxy');
    if (!$msRect) {
      $msRect = ms_newRectObj();
    }
    for ($i = 0; $i < 4; ++$i) {
      $msRect->{$props[$i]} = $extent[$i];
    }
    return $msRect;
  }

  public static function isExtentValid($extent)
  {
    return is_array($extent) && count($extent) == 4 &&
      $extent[0] < $extent[2] && $extent[1] < $extent[3];
  }

  /**
   * Return total extent of both arguments
   *
   * @return array
   */
  public static function totalExtent($extent1, $extent2)
  {
    foreach (array(0, 1) as $dim) {
      if ($extent2[$dim + 0] !== null &&
          ($extent1[$dim + 0] === null ||
           $extent2[$dim + 0] < $extent1[$dim + 0])) {
        $extent1[$dim + 0] = $extent2[$dim + 0];
      }
      if ($extent2[$dim + 2] !== null &&
          ($extent1[$dim + 2] === null ||
           $extent2[$dim + 2] > $extent1[$dim + 2])) {
        $extent1[$dim + 2] = $extent2[$dim + 2];
      }
    }
    return $extent1;
  }

  public static function setMsColor($msColor, $hex)
  {
    $r = intval(hexdec(substr($hex, 1, 2)));
    $g = intval(hexdec(substr($hex, 3, 2)));
    $b = intval(hexdec(substr($hex, 5, 2)));
    $msColor->setRGB($r, $g, $b);
  }

  public static function getMsMapSrs(MsMap $msMap)
  {
    $defs = $msMap->getProjection();
    return str_replace('+init=', '', $defs);
  }

  public static function setLayerConnection(ContainerInterface $container,
                                            MsLayer $msLayer,
                                            OgrLayer $layer, $ogrOnly = false)
  {
    $dataSource = $layer->getDataSource($container);
    if (!$ogrOnly &&
        method_exists($dataSource, 'getMsLayerConnection')) {
      list($type, $con, $data) = $dataSource->getMsLayerConnection($container, $layer);
    } else {
      list($type, $con, $data) = array
        (MS_OGR, $dataSource->getSourcePath($container), $layer->getName());
    }
    $msLayer->setConnectionType($type);
    if ($con) {
      $msLayer->set('connection', $con);
      $msLayer->setProcessing('CLOSE_CONNECTION=DEFER');
    }
    if ($data) {
      $msLayer->set('data', $data);
    }
  }

  public static function getMapProjEpsg(MsMap $msMap)
  {
    return intval(str_replace('+init=epsg:', '',
                              strtolower($msMap->getProjection())));
  }

  /**
   * @param $string string
   * @param $format can be: 'wkt', 'proj4'; if NULL, it is guessed
   * @return \OGRSpatialReference
   */
  public static function parseSpatialRef($string, $format = null)
  {
    $string = trim($string);
    if (!$format) {
      if (is_numeric($string)) {
        $format = 'proj4';
        $string = '+init=epsg:'.$string;
      } elseif (preg_match('/^epsg:([0-9]+)$/i', $string, $matches)) {
        $format = 'proj4';
        $string = '+init='.strtolower($string);
      } elseif (preg_match('/^\+/', $string)) {
        $format = 'proj4';
      } elseif (preg_match('/^[A-Z]+\[/', $string)) {
        $format = 'wkt';
      } else {
        throw new Geo\Exception('could not guess format for spatialRef: '
                                .$string);
      }
    }
    //throw new \Exception('grr-'.$string.'-'.$format);
    $ref = new \OGRSpatialReference();
    switch ($format) {
    case 'wkt':
      $err = $ref->importFromWkt($string);
      break;
    case 'proj4':
      $err = $ref->importFromProj4($string);
      break;
    /* case 'epsg': //BROKEN? */
    /*   //throw new \Exception('grr-'.intval($string).'-'.$format); */
    /*   $err = $ref->importFromEPSGA(intval($string)); */
    /*   break; */
    default:
      throw new Geo\Exception('invalid spatialRef format: '.$format);
    }
    if ($err != OGRERR_NONE) {
      throw new Geo\Exception('failed to parse spatialRef with format "'
                              .$format.'": '.$string, $err);
    }
    return $ref;
  }

  /**
   * Identify EPSG code for given spatial reference
   *
   * NO: first, the $ref method AutoIdentifyEPSG is tried, and if fails, /NO
   * the webservice prj2epsg.org is used.
   *
   * @return integer
   */
  public static function identifyEpsg(\OgrSpatialReference $ref, &$struct = array())
  {
    $t = rawurlencode($ref->exportToWkt());
    $url = 'http://prj2epsg.org/search.json?mode=wkt&terms='.$t;
    $c = file_get_contents($url);
    $struct = json_decode($c, true);
    $struct['url'] = $url;
    return $struct['exact'] ? intval($struct['codes'][0]['code']) : null;
    //return $c;
  }
}
