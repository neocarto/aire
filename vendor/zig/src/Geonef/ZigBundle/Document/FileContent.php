<?php

namespace Geonef\ZigBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Field;
use Doctrine\ODM\MongoDB\Mapping\Annotations\File as MongoFile;

/**
 * @Document
 */
class FileContent
{
  /**
   * @Id
   */
  public $uuid;

  /**
   * @Field
   */
  protected $name;

  /**
   * @MongoFile
   */
  protected $file;

  /**
   * @Field
   */
  protected $uploadDate;

  /**
   * @Field
   */
  protected $length;

  /**
   * @Field
   */
  protected $chunkSize;

  /**
   * @Field
   */
  protected $md5;

  public function getId()
  {
    return $this->uuid;
  }

  public function getFile()
  {
    return $this->file;
  }

  public function setFile($path)
  {
    $this->file = $path;
  }

  public function getPath($path = null)
  {
    if (is_string($this->file)) {
      return $this->file;
    } elseif (is_object($this->file)) {
      if (!$path) {
        $path = $this->file->getFileName();
      }
      $this->file->write($path);
      return $path;
    } else {
      return null;
    }
  }

  public function getLength()
  {
    return $this->length;
  }

  // public function getBytes()
  // {
  //   //
  // }

}
