<?php

namespace Geonef\ZigBundle\Document\File;

use Geonef\ZigBundle\Document\File as AbstractFile;
use Geonef\ZigBundle\Document\FileContent;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\Zig\Util\FileSystem;
use Geonef\Zig\Util\Dev;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceOne;

/**
 * @Document
 */
class GridFs extends AbstractFile
{
  /**
   * @ReferenceOne(
   *    targetDocument="Geonef\ZigBundle\Document\FileContent")
   */
  public $content;

  /*public function getFile()
  {
    return $this->file;
    }*/

  public function setFile($path)
  {
    if (!$this->content) {
      $this->content = new FileContent();
      $this->dm->persist($this->content);
    }
    $this->content->setFile($path);
    $this->stat();
  }

  public function getPath($baseDir = null)
  {
    if (!$this->content) {
      return null;
    }
    $content = Dev::getRealDocument($this->content, $this->dm);
    return $content->getPath
      ($baseDir && $this->name ?
       FileSystem::makePath($baseDir, $this->name) : null);
  }

  public function getSize()
  {
    if (!$this->content) {
      return null;
    }
    return $this->content->getLength();
  }

}
