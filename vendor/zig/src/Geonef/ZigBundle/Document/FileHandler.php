<?php

namespace Geonef\ZigBundle\Document;

use Geonef\ZigBundle\Document\FileHandler as AbstractFileHandler;
use Geonef\ZigBundle\Document\File;
use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\EmbeddedDocument;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;

/**
 * Base class for file handlers
 *
 * @EmbeddedDocument
 */
abstract class FileHandler
{
  /**
   * @Id
   */
  public $uuid;

  /**
   *
   */
  protected $file;

  /**
   *
   */
  protected $container;

  public function __construct(File $file, ContainerInterface $container)
  {
    $this->setFile($file, $container);
  }

  public function setFile(File $file, ContainerInterface $container)
  {
    $this->file = $file;
    $this->container = $container;
  }

  /**
   * Return whether the handler supports the given file
   */
  public static function doesSupport(File $file)
  {
    throw new \Exception('must be overloaded');
  }
}
