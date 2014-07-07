<?php
namespace Geonef\PloomapBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Geonef\PloomapBundle\Document\Map;
use Geonef\Zig\Util\Dev;
use \mapObj;

use Funkiton\InjectorBundle\Annotation\Inject;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * Handle OGC Web Service request
 *
 * The requets is forwarded to the UMN MapServer library.
 *
 * @Inject("doctrine.odm.mongodb.documentManager", name="dm")
 *
 * @package Ploomap
 * @see http://mapserver.org/ogc/mapscript.html
 */
class OwsController extends Controller
{

  /**
   * Entry point
   *
   * @Route("/ows/{id}", name="geonef_ploomap_ows")
   */
  public function requestAction(Map $map)
  {
    //echo 'grrr:'.getenv('MS_DEBUGLEVEL'); exit;
    //$mapBuilder = $this->getMapBuilder($mapRef);
    $msRequest = $this->setUpOwsRequest();
    $msMap = $map->build($this->container);
    //$this->adjustMapObj($msMap, $mapRef);
    $this->dm->flush();

    return $this->executeRequest($msRequest, $msMap);
  }

  protected function executeRequest(\OWSRequestObj $msRequest, \mapObj $msMap)
  {
    ms_ioInstallStdoutToBuffer();
    $ret = $msMap->owsDispatch($msRequest);
    $contentType = ms_ioStripStdoutBufferContentType();
    $output = ms_ioGetStdoutBufferString(); // doesn't work: only 4 bytes?!!
    ms_ioResetHandlers();
    /* ob_start(); */
    /* ms_ioGetStdoutBufferBytes(); */
    /* ms_ioResetHandlers(); */
    /* $output = ob_get_contents(); */
    /* ob_end_clean(); */
    //echo strlen($output).'||';var_dump($output); exit;
    $response = new Response();
    switch ($ret) {
    case MS_DONE:
      throw new \Exception('invalid OWS request');
    case MS_FAILURE:
      //throw new \Exception('OWS request failure [content-type='.$contentType.']: '.$output);
    case MS_SUCCESS:
      //$this->extractContentHeaders($output, $response);
      /* if ($contentType) { */
        $response->headers->set('Content-Type', $contentType);
      /* } else { */
      /*   //throw new \Exception('no content-type ('.gettype($contentType) */
      /*   //                     .'): '.strval($contentType)); */
      /* } */
      $response->setContent($output);
      break;
    default:
      throw new \Exception('unexpected return code from mapObj::owsDipatch(): '.$ret);
    }

    return $response;
  }

  /**
   * Strip off Content-* headers from buffer and set them on response object
   *
   * @param $buffer  string     Ref to buffer string, which may include Content-* headers
   * @param $reponse Response   Framework-dependant response object to add the headers to
   */
  protected function extractContentHeaders(&$buffer, Response $response)
  {
    $length = -1;
    $regex = "/^(Content-[a-zA-Z-]+): ([a-zA-Z0-9.\/=?!_; -]+)\n/";
    $cb = function($m) use ($response) {
      $response->headers->set($m[1], $m[2]);
      return '';
    };
    while (strlen($buffer) != $length) {
      $length = strlen($buffer);
      $buffer = preg_replace_callback($regex,$cb, $buffer);
    }
  }

  /**
   * Make MapScript OWS request object from HTTP query string
   *
   * @return \ms_ows_request_Obj
   */
  protected function setUpOwsRequest()
  {
    $request = ms_newOwsRequestObj();
    //$request->loadparams();
    foreach ($_REQUEST as $n => $v) {
      if ($n[0] !== '_') {
        $request->setParameter($n, $v);
      }
    }

    return $request;
  }

  /**
   * Fetch map builder class, from MongoDB
   */
  /* protected function getMapBuilder($mapRef) */
  /* { */
  /*   $class = 'Geonef\\PloomapBundle\\Document\\Map'; */
  /*   if (strpos($mapRef, '{') === false) { */
  /*     $map = Dev::findDocument($class, $mapRef, $this->dm); */
  /*   } else { */
  /*     $data = json_decode($mapRef, true); */
  /*     if (!$data) { */
  /*       throw new \Exception('arg is invalid JSON data: '.$mapRef); */
  /*     } */
  /*     $map = Dev::arrayToDocument($data, $class, $this->container); */
  /*     //echo $map->getMapString($this->container);exit; */
  /*     //var_dump($data);exit; */
  /*   } */

  /*   return $map; */
  /* } */

  /**
   * Update MS map object for OWS use
   */
  /* protected function adjustMapObj(mapObj $mapObj, $mapRef) */
  /* { */
  /*   // $url = $this->generateUrl('ploomapOwsDefault', */
  /*   //                           array('mapRef' => $mapRef), true); */
  /*   // //$this->container->get('logger')->debug('ploomap url: '.$url); */
  /*   // //$url .= '?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities&'; */
  /*   // $props = array('wms_onlineresource' => $url, */
  /*   //                'onlineresource' => $url, */
  /*   //                'wms_title' => $mapObj->name); */
  /*   // foreach ($props as $p => $n) { */
  /*   //   $mapObj->web->metadata->set($p, $n); */
  /*   // } */
  /*   // $mapObj->selectOutputFormat('png'); */
  /*   // $mapObj->outputformat->set('driver', 'AGG/PNG'); */
  /* } */

}
