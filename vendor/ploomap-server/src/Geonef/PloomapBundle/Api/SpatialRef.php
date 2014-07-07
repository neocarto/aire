<?php

namespace Geonef\PloomapBundle\Api;

use Geonef\Zig\Api\ActionDispatcher;
use Doctrine\Common\Collections\ArrayCollection;
use Geonef\Ploomap\Util\Geo;

class SpatialRef extends ActionDispatcher
{
  public function getDetailAction()
  {
    // http://prj2epsg.org/search.json?mode=wkt&terms=
    $this->checkArguments(array('spatialRef'));
    $spatialRef = $this->request['spatialRef'];
    /* $format = isset($this->request['format']) ? */
    /*   $this->request['format'] : null; */
    /* try { */
    /*   $ref = Geo::parseSpatialRef($spatialRef, $format); */
    /* } */
    $ref = new \OGRSpatialReference();
    $ref->SetFromUserInput($spatialRef);
    /* catch (Geo\Exception $e) { */
    /*   $this->response['status'] = 'error'; */
    /*   $this->response['error'] = 'invalidInput: '.$e->getMessage(); */
    /*   $this->response['spatialRef'] = $spatialRef; */
    /*   return; */
    /* } */
    $this->response['type'] =
      $ref->IsGeographic() ? 'géographique' :
      ($ref->IsProjected() ? 'projeté' :
       ($ref->IsLocal() ? 'local' : 'inconnu'));
    $ref->AutoIdentifyEPSG();
    $authName = $ref->getAuthorityName();
    $this->response['auth'] = $authName ?
      array('name' => $authName, 'code' => $ref->getAuthorityCode()) : null;
    $this->response['epsg'] = Geo::identifyEpsg($ref, $struct); //$ref->GetEPSGGeogCS();
    $this->response['prj2epsg'] = $struct;
    $this->response['formats'] = array
      ('proj4' => $ref->exportToProj4(),
       'wkt' => $ref->exportToWkt(),
       'prettyWkt' => $ref->exportToPrettyWkt(),
       'xml' => $ref->exportToXML());
  }

  public function testAction()
  {
    $this->checkArguments(array('in'));
    $this->response['t1'] = $this->_test($this->request['in']);
    //$this->response['t2'] = $this->_test($this->response['t1']['formats']['proj4']);
  }
  private function _test($in)
  {
    //putenv('GDAL_DATA=/usr/local/opt/gdal-1.7.3/share/gdal');
    $ref = new \OGRSpatialReference();
    //CplSetConfigOption('GDAL_DATA', getenv('GDAL_DATA'));
    //CplSetConfigOption('GDAL_DATA', '/usr/local/opt/okapi/share/gdal');
    $ret = $ref->SetFromUserInput($in);
    //$ret = $ref->importFromEPSG($in);
    //$r['_p'] = CplGetConfigOption('GDAL_DATA', null);
    $ref->AutoIdentifyEPSG();
    //$r['path'] = getenv('GDAL_DATA');
    $r['identify'] = Geo::identifyEpsg($ref);
    $r['in'] = $in;
    $r['ret'] = $ret;
    $r['epsg'] = $ref->GetEPSGGeogCS();
    $r['formats'] = array
      ('proj4' => $ref->exportToProj4(),
       'wkt' => $ref->exportToWkt(),
       //'prettyWkt' => $ref->exportToPrettyWkt(),
       //'xml' => $ref->exportToXML()
       );
    return $r;
  }
}
