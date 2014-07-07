<?php

namespace Geonef\ZigBundle\EventListener\Document;

use Geonef\ZigBundle\EventListener\DocumentEventArgs;
use Geonef\ZigBundle\Document\File;
use JMS\DiExtraBundle\Annotation as DI;

/**
 * All file-related listeners
 *
 * Some methods listen to other doc's events, in order to make actions
 * related to templates.
 *
 * @DI\Service("geonef_zig.document_listener.file",
 *             parent="geonef_zig.document_listener.abstract", public=true)
 */
class FileListener extends AbstractDocumentListener
{

  /**
   * @DI\Observe("model.geonefZig.file.onDelete")
   */
  public function onDelete(DocumentEventArgs $args)
  {
    $file = $args->getDocument();
    if ($file instanceOf File\GridFs && $file->content) {
      $this->dm->remove($file->content);
    }
  }

}
