<?php
namespace Geonef\PloomapBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Geonef\PloomapBundle\Document\Map;

use Funkiton\InjectorBundle\Annotation\Inject;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * Handle various requests about maps
 *
 * @Route("/map")
 * @Inject("doctrine.odm.mongodb.documentManager", name="dm")
 * @Inject("session", name="session")
 *
 * @package Ploomap
 */
class MapController extends Controller
{
  const DOC_PREFIX = 'Geonef\PloomapBundle\Document\\';

  /**
   *
   *
   * @Route("/{id}/csvFeatures",
   *        name="geonef_ploomap_map_csvfeatures")
   * @Route("/{id}/csvFeatures/{_locale}",
   *        name="geonef_ploomap_map_csvfeatures_i18n")
   * @param string $mapRef      value to identify the requested map
   */
  public function csvFeaturesAction(Map $map)
  {
    $this->checkMapPublished($map);
    $locale = $this->session->getLocale();
    $sep = $locale == 'fr' ? ";" : ",";
    //$map = $this->getMap($id);
    $msMap = $map->build($this->container);
    $msLayer = $msMap->getLayerByName($n=$map->getStatisticsValueLayer());
    $msLayer->open();
    $msLayer->whichShapes($msMap->extent);
    if (!$msLayer) {
      throw new \Exception('layer not defined in mapObj: '.$n);
    }
    $fp = fopen('php://temp', 'w+');
    while ($msShape = $msLayer->nextShape()) {
      if (!isset($keys)) {
        $vals = $msShape->values;
        if (isset($vals['id'])) {
          unset($vals['ogc_fid']);
        }
        $keys = array_keys($vals);
        fputcsv($fp, $keys, $sep);
      }
      $values = array();
      foreach ($keys as $key) {
        $val = $msShape->values[$key];
        if ($locale == 'fr' && is_numeric($val)) {
          // in French, use "," for number's decimal separator
          $val = strtr(''.$val, '.', ',');
        }
        $values[] = $val;
      }
      fputcsv($fp, $values, $sep);
    }
    if (!isset($keys)) {
      fputcsv($fp, array("error", "CVS export not supported for this type of map"), $sep);
    }
    rewind($fp);
    $response = new Response(stream_get_contents($fp));
    fclose($fp);
    $response->headers->set('Content-Type', 'text/csv');
    $response->headers->set('Content-disposition',
                            'attachment; filename=data.csv');
    return $response;
  }

  /**
   * @Route("/{id}/svg/{_locale}",
   *        name="geonef_ploomap_map_svg_i18n")
   */
  public function svgAction(Map $map)
  {
    $this->checkMapPublished($map);
    //$map = $this->getMap($id);
    $template = $map->svgTemplate;
    if (!$template) {
      throw new \Exception('map has no SVG template defined: '.$map->getId());
    }
    //return new Response('grrr6'.$template->getContent());
    $template->applyTo($this->container, $map);
    $this->dm->flush();
    //echo $template->getContent(); echo 'blabla';
    $response = new Response($template->getContent());
    $response->headers->set('Content-Type', $template->getContentType());

    return $response;
  }

  /**
   * @Route("/{id}/sld/{layer}",
   *        name="geonef_ploomap_map_sld")
   */
  public function sldAction(Map $map, $layer)
  {
    $this->checkMapPublished($map);
    $msMap = $map->build($this->container);
    $msLayer = $msMap->getLayerByName($layer);
    $sld = $msLayer->generateSLD();
    $response = new Response($sld);
    $response->headers->set('Content-Type', 'text/xml');

    return $response;
  }

  /**
   * @Route("/{id}/mapFile",
   *        name="geonef_ploomap_map_file")
   */
  public function mapFileAction(Map $map)
  {
    $this->checkMapPublished($map);
    $mapFile = $map->getMapString($this->container);
    $response = new Response($mapFile);
    $response->headers->set('Content-Type', 'text/plain');

    return $response;
  }

  protected function checkMapPublished(Map $map)
  {
    if (!$map->isPublished()) {
      throw new \Exception("map's publishing is not enabled for ".$map->getId());
    }

  }
}
