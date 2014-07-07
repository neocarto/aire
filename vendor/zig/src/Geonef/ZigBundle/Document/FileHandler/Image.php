<?php

namespace Geonef\ZigBundle\Document\FileHandler;

use Geonef\ZigBundle\Document\FileHandler as AbstractFileHandler;
use Geonef\ZigBundle\Document\File;

use Doctrine\ODM\MongoDB\Mapping\Annotations as Doctrine;

/**
 * Image handler
 *
 * @Doctrine\EmbeddedDocument
 */
class Image extends AbstractFileHandler
{
  protected $imagick;

  /**
   * Return whether the handler supports the given file
   */
  public static function doesSupport(File $file)
  {
    $imagick = new \Imagick();
    try {
      $supported = $imagick->readImage($file->getPath());
    }
    catch (\Exception $e) {
      $supported = false;
    }
    $imagick->destroy();

    return $supported;
  }

  /**
   * @param integer $size       size in pixels or null for default (32 pixels)
   */
  public function getThumbnail($size = null)
  {
    if (!$size) {
      $size = 32;
    }
    $path = tempnam('/tmp', 'geonef_'.uniqid());
    $imagick = $this->getImagick();
    $imagick->cropThumbnailImage($size, $size);
    $imagick->writeImage($path);
    $file = new File\GridFs($this->container);
    $file->setFile($path);

    return $file;
    //$name = $this->file->getName().'-thumb-'.$size;
  }

  protected function getImagick()
  {
    if (!$this->imagick) {
      $this->imagick = new \Imagick($this->file->getPath());
    }

    return $this->imagick;
  }

}
