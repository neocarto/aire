<?php

namespace Geonef\ZigBundle\Document\Template;

use Geonef\ZigBundle\Document\Template as AbstractTemplate;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\Zig\Util\String;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Gedmo\Mapping\Annotation\Translatable;

/**
 * @Document
 */
class Text extends AbstractTemplate
{
  /**
   * @Translatable
   * @MongoString
   */
  public $content;

  /**
   * @MongoString
   */
  public $contentType = 'text/plain';

  /** inherited */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    $state &= $this->checkCond(strlen(trim($this->content)) > 0,
                               'content', array('invalid', "Obligatoire"),
                               $errors);

    return $state;
  }

  /** inherited */
  protected function doApply(ContainerInterface $container, $document)
  {
    $this->applyContentType = $this->contentType;
    return $this->doApplySubstitutions($container, $document);
  }

  protected function doApplySubstitutions(ContainerInterface $container, $document)
  {
    $str = String::substitute($this->content, $document);

    return $str;
  }

}
