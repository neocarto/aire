<?php

namespace Geonef\PloomapBundle\EventListener;

use Geonef\ZigBundle\EventListener\Document\AbstractDocumentListener;
use Geonef\ZigBundle\EventListener\OnDocumentChangeEventArgs;
use Geonef\ZigBundle\EventListener\DocumentEventArgs;
use JMS\DiExtraBundle\Annotation as DI;
use Geonef\PloomapBundle\Document\Map;
use MongoId;

/**
 * All map-related listeners
 *
 * Some methods listen to other doc's events, in order to make actions
 * related to maps.
 *
 * @DI\Service("geonef_ploomap.document_listener.map",
 *             parent="geonef_zig.document_listener.abstract",public=true)
 */
class MapListener extends AbstractDocumentListener
{
  /**
   * Service container
   *
   * @DI\Inject("service_container")
   */
  public $container;


  /**
   * @DI\Observe("model.geonefPloomap.map.onChange")
   */
  public function onChange(OnDocumentChangeEventArgs $args)
  {
    if ($args->hasChangesOtherThan(array('infoCache', 'lastEditedAt'))) {
      $this->dispatchDocumentEvent($args->getDocument(), 'onMapChange', $args);
    }
  }

  /**
   * @DI\Observe("model.geonefPloomap.map.onMapChange")
   */
  public function dispatchChangeToSubMaps(DocumentEventArgs $args)
  {
    $id = $args->getDocument()->getId();
    $this->logger->debug("check Map on mapChange: ".$id);
    $q = $this->dm->createQueryBuilder('Geonef\\PloomapBundle\\Document\\Map\\ModelBased')
      ->field('modelMap.$id')->equals(new MongoId($id))
      ->getQuery();
    $it = $q->execute();
    $this->logger->debug("Ploomap MapListener: change in map ".$id." impacts  "
                         .$it->count() ." sub-maps ** oka");
    foreach ($it as $map) {
      $this->logger->debug(" in map ".$map->getId());
      $this->doctrineDispatchListener
        ->dispatchDocumentEvent($map, 'onMapChange', new DocumentEventArgs($map));
    }
    // sub-map operations may have changed the infoCache
    $args->recomputeChangeSet($this->dm);
  }

  /**
   * @DI\Observe("model.geonefPloomap.map.onDelete")
   */
  public function checkSubMapsForDeletion(DocumentEventArgs $args)
  {
    $this->checkReferences($args->getDocument(), "map",
                           array('Geonef\\PloomapBundle\\Document\\Map\\ModelBased'),
                           "maps based on it", 'modelMap');
  }

  /**
   * @DI\Observe("model.geonefPloomap.map.onMapChange")
   */
  public function clearMapInfoCache(DocumentEventArgs $args)
  {
    $map = $args->getDocument();
    if ($map->clearInfoCache($this->container)) {
      $args->recomputeChangeSet($this->dm);
    }
  }

  /**
   * @DI\Observe("model.geonefPloomap.colorFamily.onChange")
   */
  public function onColorFamilyChange(OnDocumentChangeEventArgs $args)
  {
    $id = $args->getDocument()->getId();
    if ($args->hasChanges(array('colors'))) {
      $q = $this->dm->createQueryBuilder(array('Geonef\\PloomapBundle\\Document\\Map\Ratio',
                                               'Geonef\\PloomapBundle\\Document\\Map\StockRatio',
                                               'Geonef\\PloomapBundle\\Document\\Map\Potential'))
        ->field('colorFamily.$id')->equals(new MongoId($id))
        ->getQuery();
      $it = $q->execute();
      $this->logger->info("Ploomap MapListener: change in colorFamily ".$id." impacts "
                          .$it->count()." maps ** oka");
      foreach ($it as $map) {
        $this->doctrineDispatchListener
          ->dispatchDocumentEvent($map, 'onMapChange', new DocumentEventArgs($map));
      }
    }
  }

  /**
   * @DI\Observe("model.geonefPloomap.colorFamily.onDelete")
   */
  public function onColorFamilyDelete(DocumentEventArgs $args)
  {
    $this->checkReferences($args->getDocument(), "color family",
                           array('Geonef\\PloomapBundle\\Document\\Map\Ratio',
                                 'Geonef\\PloomapBundle\\Document\\Map\StockRatio',
                                 'Geonef\\PloomapBundle\\Document\\Map\Potential'),
                           "maps", 'colorFamily');
  }

  /**
   * @DI\Observe("model.geonefZig.template.onChange")
   */
  public function onTemplateChange(OnDocumentChangeEventArgs $args)
  {
    $id = $args->getDocument()->getId();
    if ($args->hasChangesOtherThan(array('name', 'lastEditedAt'))) {
      $q = $this->dm->createQueryBuilder('Geonef\\PloomapBundle\\Document\\Map')
        ->field('svgTemplate.$id')->equals(new MongoId($id))
        ->getQuery();
      $it = $q->execute();
      $this->logger->info("Ploomap MapListener: change in template ".$id." impacts "
                          .$it->count()." maps ** oka");
      foreach ($it as $map) {
        $this->doctrineDispatchListener
          ->dispatchDocumentEvent($map, 'onSvgTemplateChange', new DocumentEventArgs($map));
      }
    }
  }

  /**
   * @DI\Observe("model.geonefZig.template.onDelete")
   */
  public function onTemplateDelete(DocumentEventArgs $args)
  {
    $this->checkReferences($args->getDocument(), "template",
                           array('Geonef\\PloomapBundle\\Document\\Map'),
                           "maps", 'svgTemplate');
  }

  /**
   * @DI\Observe("model.geonefPloomap.mapCollection.onDelete")
   */
  public function checkMapsForCollectionDeletion(DocumentEventArgs $args)
  {
    $this->checkReferences($args->getDocument(), "map collection",
                           array('Geonef\\PloomapBundle\\Document\\Map'),
                           "maps", 'mapCollection');
  }

  /**
   * @DI\Observe("model.geonefPloomap.gdalDataset.onDelete")
   */
  public function onGdalDatasetDelete(DocumentEventArgs $args)
  {
    $this->checkReferences($args->getDocument(), "GDAL dataset",
                           array('Geonef\\PloomapBundle\\Document\\Map\\Potential'),
                           "potential maps", 'gdalDataset');
  }

  /**
   * @DI\Observe("model.geonefPloomap.ogrLayer.onDelete")
   */
  public function onOgrLayerDelete(DocumentEventArgs $args)
  {
    $this->checkReferences($args->getDocument(), "vector layer",
                           array('Geonef\\PloomapBundle\\Document\\Map\\Stock',
                                 'Geonef\\PloomapBundle\\Document\\Map\\StockRatio',
                                 'Geonef\\PloomapBundle\\Document\\Map\\Ratio',
                                 'Geonef\\PloomapBundle\\Document\\Map\\RatioDisc',
                                 'Geonef\\PloomapBundle\\Document\\Map\\RatioGrid',
                                 'Geonef\\PloomapBundle\\Document\\Map\\Cartogram'),
                           "stock/ratio maps", 'polygonOgrLayer');
    $this->checkReferences($args->getDocument(), "vector layer",
                           array('Geonef\\PloomapBundle\\Document\\Map\\Stock',
                                 'Geonef\\PloomapBundle\\Document\\Map\\StockRatio',
                                 'Geonef\\PloomapBundle\\Document\\Map\\Ratio',
                                 'Geonef\\PloomapBundle\\Document\\Map\\RatioDisc',
                                 'Geonef\\PloomapBundle\\Document\\Map\\RatioGrid',
                                 'Geonef\\PloomapBundle\\Document\\Map\\Cartogram'),
                           "stock/ratio maps", 'infoTable');

    $this->checkReferences($args->getDocument(), "vector layer",
                           array('Geonef\\PloomapBundle\\Document\\Map\\Stock',
                                 'Geonef\\PloomapBundle\\Document\\Map\\StockRatio'),
                           "stock/stockRatio maps", 'symbolOgrLayer');
    $this->checkReferences($args->getDocument(), "vector layer",
                           array('Geonef\\PloomapBundle\\Document\\Map\\Stock',
                                 'Geonef\\PloomapBundle\\Document\\Map\\StockRatio'),
                           "stock/stockRatio maps", 'indicatorTable');

    $this->checkReferences($args->getDocument(), "vector layer",
                           array('Geonef\\PloomapBundle\\Document\\Map\\StockRatio',
                                 'Geonef\\PloomapBundle\\Document\\Map\\Ratio',
                                 'Geonef\\PloomapBundle\\Document\\Map\\RatioDisc',
                                 'Geonef\\PloomapBundle\\Document\\Map\\RatioGrid',
                                 'Geonef\\PloomapBundle\\Document\\Map\\Cartogram'),
                           "ratio maps", 'numeratorTable');
    $this->checkReferences($args->getDocument(), "vector layer",
                           array('Geonef\\PloomapBundle\\Document\\Map\\StockRatio',
                                 'Geonef\\PloomapBundle\\Document\\Map\\Ratio',
                                 'Geonef\\PloomapBundle\\Document\\Map\\RatioDisc',
                                 'Geonef\\PloomapBundle\\Document\\Map\\RatioGrid',
                                 'Geonef\\PloomapBundle\\Document\\Map\\Cartogram'),
                           "ratio maps", 'denominatorTable');

    $this->checkReferences($args->getDocument(), "vector layer",
                           array('Geonef\\PloomapBundle\\Document\\Map\\RatioDisc'),
                           "ratioDisc maps", 'discOgrLayer');

    $this->checkReferences($args->getDocument(), "vector layer",
                           array('Geonef\\PloomapBundle\\Document\\Map\\RatioGrid'),
                           "ratioGrid maps", 'gridOgrLayer');
    $this->checkReferences($args->getDocument(), "vector layer",
                           array('Geonef\\PloomapBundle\\Document\\Map\\RatioGrid'),
                           "ratioGrid maps", 'matchTable');
  }

}

