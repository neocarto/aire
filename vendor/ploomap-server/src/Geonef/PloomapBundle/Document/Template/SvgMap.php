<?php

namespace Geonef\PloomapBundle\Document\Template;

use Geonef\ZigBundle\Document\Template\Text;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PloomapBundle\Document\Map;
use Geonef\Zig\Registry\Mapper;
use Geonef\Zig\Util\Dom;
use Geonef\Zig\Util\Dom\Svg;
use Geonef\Zig\Util\CssParser\CssParser;
use Geonef\Ploomap\Util\Geo;
use DOMDocument;
use DOMElement;
use DOMXPath;
use mapObj as MsMap;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Float;
use Gedmo\Mapping\Annotation\Translatable;

/**
 * @Document
 */
class SvgMap extends Text
{

  /**
   * @MongoString
   */
  public $mapElementId = 'map';

  /**
   * @MongoString
   */
  public $legendElementId = 'legend';

  /**
   * @Float
   */
  public $legendSizeFactor = 1.0;

  /**
   * @MongoString
   */
  public $additionalCss = '';

  /** inherited */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    if ($state) {
      try {
        $svgDoc = Dom::loadXmlString($this->content);
      }
      catch (\Exception $e) {
        $state &= $this->checkCond(false, 'content',
                                   array('invalid', "Le texte n'est pas du "
                                         ."XML valide: ".$e->getMessage()),
                                   $errors);
      }
      if ($state) {
        foreach (array('mapElementId', 'legendElementId') as $prop) {
          if (!$this->$prop) { continue; }
          try {
            $node = $this->getElementById($svgDoc, $this->$prop);
            foreach (array('x', 'y', 'width', 'height') as $k) {
              $state &= $this->checkCond($node->getAttribute($k) > 0, $prop,
                                         array('invalid', "L'élément (ID '".$this->$prop
                                               ."') n'a pas l'attribut '".$k
                                               ."' (rectangle conseillé)."),
                                         $errors);
            }
          }
          catch (\Exception $e) {
            $state &= $this->checkCond(false, $prop,
                                       array('invalid', "L'ID fournit ('".$this->$prop
                                             ."') n'a pas été trouvé dans le document."),
                                       $errors);
          }
        }
        $state &= $this->checkCond($this->mapElementId &&
                                   $this->mapElementId != $this->legendElementId,
                                   'legendElementId',
                                   array('invalid', "La légende et la carte ne "
                                         ."peuvent partager le même ID."),
                                   $errors);
        if (trim($this->additionalCss) != '') {
          $cssParser = new CssParser($this->additionalCss);
          try {
            $cssParser->parse();
          }
          catch (\Exception $e) {
            $state &= $this->checkCond(false, 'additionalCss',
                                       array('invalid', "La syntaxe de ce CSS n'est pas valide : "
                                             .$e->getMessage()),
                                       $errors);
          }
        }
      }
    }
    $state &= $this->checkCond(strlen($this->mapElementId) > 0, 'mapElementId',
                               array('invalid', "L'ID de l'élément <rect> est obligatoire "
                                     ."pour l'insertion de la carte dans le template."),
                               $errors);

    return $state;
  }

  /** inherited */
  public function getSupportedClasses()
  {
    return array('Map');
  }

  /** inherited */
  protected function doApply(ContainerInterface $container, /*Map*/ $map)
  {
    $templateTxt = parent::doApply($container, $map);
    $templateSvg = $this->getTemplateSvg($templateTxt, $map);
    $rectNode = $this->getElementById($templateSvg, $this->mapElementId);
    $msMap = true;
    $mapSvg = $this->getMapSvg($container, $map, $rectNode, $msMap);
    $this->integrateMapInTemplate($templateSvg, $rectNode, $mapSvg);
    $resolution = $this->computeResolution($container, $map, $rectNode, $msMap);
    if ($this->legendElementId) {
      $this->buildLegend($container, $templateSvg, $map, $resolution);
    }

    $this->addCssClasses($container, $templateSvg, $map);
    if (trim($this->additionalCss) != '') {
      Svg::inlineCss($templateSvg, $this->additionalCss, $container->get('logger'));
    }
    $serializedSvg = $templateSvg->saveXML();
    //$serializedSvg = $mapSvg->saveXML();
    $this->applyContentType = 'image/svg+xml';
    return $serializedSvg;
  }

  /**
   * Compute map resolution, in projected units per SVG doc units
   *
   * @param Map $map
   * @param DOMElement $rectNode
   * @return float
   */
  protected function computeResolution(ContainerInterface $container,
                                       Map $map, DOMElement $rectNode, MsMap $msMap)
  {
    $e = Geo::msRectToExtent($msMap->extent);
    $xRes = ($e[2] - $e[0]) / $w=floatval($rectNode->getAttribute('width'));
    $yRes = ($e[3] - $e[1]) / $h=floatval($rectNode->getAttribute('height'));
    return max($xRes, $yRes);
  }

  protected function getMapSvg(ContainerInterface $container, Map $map,
                               DOMElement $rectNode, &$msMap)
  {
    $msMap = $map->build($container);
    $msMap->setSize($rectNode->getAttribute('width'),
                    $rectNode->getAttribute('height'));
    $msMap->selectOutputFormat('image/svg+xml');
    $msImage = $msMap->draw();
    //var_dump($msImage);
    //$svg = 'w= '.$msImage->width.' h='.$msImage->height.' res='.$msImage->resolution
    //.' resF='.$msImage->resolutionfactor;//
    //ob_start();
    //ms_ioInstallStdoutToBuffer();
    $file = tempnam('/tmp', uniqid());
    $status = $msImage->saveImage($file, $msMap);
    if ($status !== MS_SUCCESS) {
      throw new \Exception('could not save image in: '.$file);
    }
    //ms_ioResetHandlers();
    $svg = Dom::loadXmlFile($file);
    //$svg = file_get_contents($file);
    unlink($file);

    return $svg;
  }

  protected function getTemplateSvg($templateTxt, Map $map)
  {
    $templateSvg = Dom::loadXmlString($templateTxt);
    return $templateSvg;
  }

  protected function addCssClasses(ContainerInterface $container,
                                   DOMDocument $templateSvg, Map $map)
  {
    $classes = array();
    $ns = explode('\\', get_class($map));
    $classes = array('map_'.strtolower(end($ns)),
                     'level_'.$map->level);
    $el = $templateSvg->documentElement;
    $class = $el->getAttribute('class');
    $el->setAttribute('class', trim($class . ' ' . implode(' ', $classes)));
  }

  protected function integrateMapInTemplate(DOMDocument $templateSvg,
                                            DOMElement $rectNode,
                                            DOMDocument $mapSvg)
  {
    foreach (array('x', 'y', 'width', 'height') as $k) {
      $$k = $rectNode->getAttribute($k);
    }
    $mapNode = $templateSvg->importNode($mapSvg->documentElement, true);
    $mapNode->setAttribute('width', $width);
    $mapNode->setAttribute('height', $height);
    $gNode = $templateSvg->createElementNS(Svg::NS, 'g');
    $gNode = $templateSvg->createElement('g');
    $gNode->setAttribute('transform', 'translate('.$x.','.$y.')');
    $gNode->appendChild($mapNode);
    $rectNode->parentNode->replaceChild($gNode, $rectNode);

    //$rectNode = $this->getElementById($templateSvg, $this->mapElementId);
    //$gNode->appendChild($mapNode);
  }

  protected function buildLegend(ContainerInterface $container,
                                 DOMDocument $templateSvg, Map $map, $resolution)
  {
    $data = $map->getLegendData($container);
    $cl = explode('.', $data['widgetClass']);
    $props = array_merge(array('class' => 'Geonef\\Ploomap\\View\\SvgMapLegend\\'
                               .end($cl),
                               'resolution' => $resolution,
                               'sizeFactor' => $this->legendSizeFactor),
                         $data['value']);
    $view = Mapper::mapObject($props);
    $view->setTranslator($container->get('translator'));
    $legendSvg = $view->build();
    $doc = Dom::loadXmlString($legendSvg);
    $rectNode = $this->getElementById($templateSvg, $this->legendElementId);
    foreach (array('x', 'y', 'width', 'height') as $k) {
      $$k = $rectNode->getAttribute($k);
    }
    $legendNode = $templateSvg->importNode($doc->documentElement, true);
    $gNode = $templateSvg->createElementNS(Svg::NS, 'g');
    $gNode = $templateSvg->createElement('g');
    $gNode->setAttribute('legend-resolution', $resolution);
    $gNode->setAttribute('legend-size-factor', $this->legendSizeFactor);
    $gNode->setAttribute('transform', 'translate('.$x.','.$y.')');
    $gNode->appendChild($legendNode);
    $rectNode->parentNode->replaceChild($gNode, $rectNode);
  }

  protected function getElementById(DOMDocument $doc, $id)
  {
    $xp = new DOMXPath($doc);
    $nl = $xp->query("//*[@id='".$id."']");
    if (!$nl->length) {
      throw new \Exception("ID not found in doc: ".$id);
    }
    return $nl->item(0);
  }
}
