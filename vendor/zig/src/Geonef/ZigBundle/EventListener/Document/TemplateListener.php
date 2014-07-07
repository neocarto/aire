<?php

namespace Geonef\ZigBundle\EventListener\Document;

use Geonef\ZigBundle\EventListener\DocumentEventArgs;
use JMS\DiExtraBundle\Annotation as DI;

/**
 * All template-related listeners
 *
 * Some methods listen to other doc's events, in order to make actions
 * related to templates.
 *
 * @DI\Service("geonef_zig.document_listener.template",
 *             parent="geonef_zig.document_listener.abstract", public=true)
 */
class TemplateListener extends AbstractDocumentListener
{

  /**
   * @DI\Observe("model.geonefZig.template.onChange")
   */
  public function onChange(DocumentEventArgs $args)
  {
    if ($args->hasChangesOtherThan(array('infoCache', 'lastEditedAt'))) {
      $this->dispatchDocumentEvent($args->getDocument(), 'onContentChange', $args);
    }
  }

  /**
   * @DI\Observe("model.geonefZig.template.onContentChange")
   */
  public function onContentChange(DocumentEventArgs $args)
  {
    $doc = $args->getDocument();
    if ($doc->clearInfoCache()) {
      $args->recomputeChangeSet($this->dm);
    }
  }


}
