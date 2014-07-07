<?php

namespace Geonef\PloomapBundle\EventListener;

use Geonef\ZigBundle\EventListener\Document\AbstractDocumentListener;
use Geonef\ZigBundle\EventListener\DocumentEventArgs;
use JMS\DiExtraBundle\Annotation as DI;

/**
 * All mapCollection-related listeners
 *
 * Some methods listen to other doc's events, in order to make actions
 * related to map collections.
 *
 * @DI\Service("geonef_ploomap.document_listener.mapCollection",
 *             parent="geonef_zig.document_listener.abstract", public=true)
 */
class MapCollectionListener extends AbstractDocumentListener
{

  /**
   * @DI\Observe("model.geonefPloomap.mapCategory.onDelete")
   */
  public function checkCollectionsForCategoryDeletion(DocumentEventArgs $args)
  {
    $this->checkReferences($args->getDocument(), "map category",
                           array('Geonef\\PloomapBundle\\Document\\MapCollection'),
                           "map collections", 'category');
  }

}
