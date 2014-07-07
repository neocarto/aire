<?php

namespace Geonef\ZigBundle\Document\FileHandler;

use Geonef\ZigBundle\Document\FileHandler as AbstractFileHandler;
use Geonef\ZigBundle\Document\File;
use Geonef\ZigBundle\Document\File\Directory;

use Doctrine\ODM\MongoDB\Mapping\Annotations\EmbeddedDocument;

/**
 * Zip archive handler
 *
 * @EmbeddedDocument
 */
class Zip extends AbstractFileHandler
{
  protected $archive;

  /**
   * Return whether the handler supports the given file
   */
  public static function doesSupport(File $file)
  {
    return $file->getContentType() == 'application/zip';
  }

  /**
   * Extract to directory
   *
   * @return Directory
   */
  public function extract()
  {
    $directory = new Directory($this->container);
    $archive = $this->getArchive();
    $names = array();
    for ($i = 0; $i < $archive->numFiles; ++$i) {
      $names[] = $archive->getNameIndex($i);
    }
    $archive->extractTo($directory->getPath(), $names);
    $directory->addFiles($names);
    return $directory;
  }

  public function getArchive()
  {
    if (!$this->archive) {
      $this->archive = new \ZipArchive();
      $path = $this->file->getPath();
      if ($this->archive->open($path) !== true) {
        throw new \Exception('failed to open zip file: '.$path);
      }
    }
    return $this->archive;
  }

}
