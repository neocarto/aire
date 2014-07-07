<?php

namespace Geonef\PloomapBundle\Service;

use Geonef\PloomapBundle\Document\Display;
use Geonef\Zig\Util\FileSystem;
use Geonef\Zig\Util\Dom;
use DOMDocument;
use DOMElement;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Component\DependencyInjection\ContainerInterface;


class GeoCache
{

  protected $title = "Geonef GeoCache service";

  protected $abstract = "Provided by Geonef";

  protected $configPath;

  protected $cachePath = '/tmp';

  /** @var array */
  protected $grids;

  /** @var DocumentManager */
  protected $dm;

  /** @var ContainerInterface */
  protected $container;


  public function __construct($configPath, $cachePath)
  {
    $this->configPath = $configPath;
    $this->cachePath = $cachePath;
  }

  public function setDocumentManager(DocumentManager $dm)
  {
    $this->dm = $dm;
  }

  public function setContainer(ContainerInterface $container)
  {
    $this->container = $container;
  }

  public function refreshCacheConfig()
  {
    $content = $this->buildCacheConfig();
    FileSystem::ensureCreatable($this->configPath);
    file_put_contents($this->configPath, $content);
  }

  /**
   * @return string Content of mod-geocache config file
   */
  public function buildCacheConfig()
  {
    $this->collectDisplaySettings();
    //var_dump($this->grids);
    //var_dump($this->tilesets);
    $doc = new DOMDocument();
    $doc->formatOutput = true;
    $this->buildBasicStructure($doc);
    $this->buildGrids($doc);
    $this->buildTileSets($doc);
    return $doc->saveXML();
  }

  protected function collectDisplaySettings()
  {
    $this->grids = array();
    $this->tilesets = array();
    $it = $this->dm->createQueryBuilder('Geonef\PloomapBundle\Document\Display\Tiled')
      ->getQuery()->execute();
    foreach ($it as $display) {
      /* $srs = $display->getSrs(); */
      /* $resolutions = $display->getResolutions(); */
      $gridId = $this->findOrAddGrid($display);
                                     /* $srs, $resolutions, */
                                     /* $display->getExtent($this->container), */
                                     /* $display->getTileWidth(), */
                                     /* $display->getTileHeight()); */
      $tileset = array('source' => $display->getCacheSource($this->container),
                       'cache' => 'default',
                       'grid' => $gridId,
                       'format' => 'png_best',
                       'metatile' => implode(' ', $display->getMetaTileDims()),
                       'metabuffer' => $display->getMetaBuffer());
      $this->tilesets[$display->getId()] = $tileset;
    }
  }

  /**
   * Find the grid in array, add it if needed
   */
  protected function findOrAddGrid(Display\Tiled $display)
                                   /* $srs, $resolutions, $extent, */
                                   /* $tileWidth, $tileHeight) */
  {
    $id = $display->getGridId($this->container);
    if (!isset($this->grids[$id])) {
      $this->grids[$id] = $display->getGrid($this->container);
    }

    return $id;
  }

  protected function buildBasicStructure(DOMDocument $doc)
  {
    $de = $doc->createElement('geocache');
    // meta
    $meta = $doc->createElement('metadata');
    $meta->appendChild(Dom::createTextElement($doc, 'title', $this->title));
    $meta->appendChild(Dom::createTextElement($doc, 'abstract', $this->abstract));
    $de->appendChild($meta);
    // services
    foreach (array('wms', 'tms') as $name) {
      $service = $doc->createElement('service');
      $service->setAttribute('type', $name);
      $service->setAttribute('enabled', 'true');
      $de->appendChild($service);
    }
    // other params
    $de->appendChild(Dom::createTextElement($doc, 'merge_format', 'png_fast'));
    $de->appendChild(Dom::createTextElement($doc, 'errors', 'report'));
    $de->appendChild(Dom::createTextElement($doc, 'full_wms', 'assemble'));
    $de->appendChild(Dom::createTextElement($doc, 'lock_dir', '/tmp'));
    $de->appendChild(Dom::createTextElement($doc, 'resample_mode', 'bilinear'));
    // cache
    $cache = $doc->createElement('cache');
    $cache->setAttribute('name', 'default');
    $cache->setAttribute('type', 'disk');
    $cache->appendChild(Dom::createTextElement($doc, 'base', $this->cachePath));
    $cache->appendChild($doc->createElement('symlink_blank'));
    $de->appendChild($cache);
    // formats
    $createFormat = function($name, $type) use (&$doc, &$de) {
      $format = $doc->createElement('format');
      $format->setAttribute('name', $name);
      $format->setAttribute('type', $type);
      $de->appendChild($format);
      return $format;
    };
    $formatPngFast = $createFormat('png_fast', 'PNG');
    $formatPngFast->appendChild(Dom::createTextElement($doc, 'compression', 'fast'));
    $formatPngBest = $createFormat('png_best', 'PNG');
    $formatPngBest->appendChild(Dom::createTextElement($doc, 'compression', 'best'));
    $formatJpeg = $createFormat('jpeg', 'JPEG');
    $formatJpeg->appendChild(Dom::createTextElement($doc, 'quality', '90'));

    $doc->appendChild($de);

    return $de;
  }

  protected function buildGrids(DOMDocument $doc)
  {
    $de = $doc->documentElement;
    foreach ($this->grids as $id => $grid) {
      $gridEl = $doc->createElement('grid');
      $gridEl->setAttribute('name', $id);
      $meta = $doc->createElement('metadata');
      $meta->appendChild(Dom::createTextElement($doc, 'title', $id.' - '.$grid['srs']));
      $gridEl->appendChild($meta);
      $gridEl->appendChild(Dom::createTextElement($doc, 'extent',
                                                  implode(' ',$grid['extent'])));
      $gridEl->appendChild(Dom::createTextElement($doc, 'srs', $grid['srs']));
      $gridEl->appendChild(Dom::createTextElement($doc, 'resolutions',
                                                  implode(' ', $grid['resolutions'])));
      $gridEl->appendChild(Dom::createTextElement($doc, 'units', $grid['units']));
      $gridEl->appendChild(Dom::createTextElement($doc, 'size', $grid['size']));
      $de->appendChild($gridEl);
    }
  }

  protected function buildTilesets(DOMDocument $doc)
  {
    $de = $doc->documentElement;
    foreach ($this->tilesets as $id => $tileset) {
      // source
      $source = $tileset['source'];
      $sourceEl = $doc->createElement('source');
      $sourceEl->setAttribute('name', $id);
      $sourceEl->setAttribute('type', 'wms');
      $sourceHttpEl = $doc->createElement('http');
      $sourceHttpEl->appendChild(Dom::createTextElement($doc, 'url', $source['url']));
      $sourceEl->appendChild($sourceHttpEl);
      $sourceGetMapEl = $doc->createElement('getmap');
      if (isset($source['params']) && count($source['params']) > 0) {
        $sourceParamsEl = $doc->createElement('params');
        foreach ($source['params'] as $n => $v) {
          $sourceParamsEl->appendChild(Dom::createTextElement($doc, $n, $v));
        }
        $sourceGetMapEl->appendChild($sourceParamsEl);
      }
      $sourceEl->appendChild($sourceGetMapEl);
      $de->appendChild($sourceEl);
      // tileset
      $tilesetEl = $doc->createElement('tileset');
      $tilesetEl->setAttribute('name', $id);
      $tilesetEl->appendChild(Dom::createTextElement($doc, 'source', $id));
      $tilesetEl->appendChild(Dom::createTextElement($doc, 'cache', 'default'));
      $tilesetEl->appendChild(Dom::createTextElement($doc, 'grid', $tileset['grid']));
      $tilesetEl->appendChild(Dom::createTextElement($doc, 'format', $tileset['format']));
      $tilesetEl->appendChild(Dom::createTextElement($doc, 'metatile', $tileset['metatile']));
      $tilesetEl->appendChild(Dom::createTextElement($doc, 'metabuffer', $tileset['metabuffer']));
      $de->appendChild($tilesetEl);
    }
  }

}
