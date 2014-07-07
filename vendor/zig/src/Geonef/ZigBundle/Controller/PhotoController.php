<?php

namespace Geonef\ZigBundle\Controller;

use Geonef\ZigBundle\Document\File;

class PhotoController extends FileController
{
  const FILE_DOC_CLASS = 'Geonef\\ZigBundle\\Document\\File';


  /**
   *
   * Variant can be:
   *    - full
   *    - thumbnail
   *    - any integer (thumbnail size)
   */
  public function viewAction(File $file, $variant = 'full')
  {
    $file->setContainer($this->container);
    //$file = $this->getFile($id);
    switch ($variant) {
    case 'full':
      $photo = $file;
      break;
    case 'thumb':
    case 'thumbnail':
      $photo = $this->getThumbnail($file);
      break;
    default:
      if (is_numeric($variant)) {
        $size = intval($variant);
        $photo = $this->getThumbnail($file, $size);
      } else {
        throw new \InvalidArgumentException('invalid variant: '.$variant);
      }
    }

    return $this->makeResponse($photo);
  }

  protected function getThumbnail(File $file, $size = null)
  {
    $image = $file->getHandler('Image');
    $photo = $image->getThumbnail($size);
    //$this->dm->persist($photo);
    //$this->dm->flush();

    return $photo;
  }

}
