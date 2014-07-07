<?php

namespace Geonef\ZigBundle\Request\ParamConverter;

use Sensio\Bundle\FrameworkExtraBundle\Request\ParamConverter\ParamConverterInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ConfigurationInterface;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Doctrine\ODM\MongoDB\MongoDBException;

class DoctrineOdmParamConverter implements ParamConverterInterface
{
  protected $documentManager;

  public function __construct(DocumentManager $dm)
  {
    $this->documentManager = $dm;
  }

  public function apply(Request $request, ConfigurationInterface $configuration)
  {
    $class = $configuration->getClass();
    $options = $configuration->getOptions();

    // find by identifier?
    if (false === $object = $this->find($class, $request, $options)) {
      // find by criteria
      if (false === $object = $this->findOneBy($class, $request, $options)) {
        throw new \LogicException('Unable to guess how to get a Doctrine ODM '
                                  .'instance from the request information.');
      }
    }

    if (null === $object && false === $configuration->isOptional()) {
      throw new NotFoundHttpException(sprintf('%s object not found.', $class));
    }

    $request->attributes->set($configuration->getName(), $object);
  }

  protected function find($class, Request $request, $options)
  {
    if (!$request->attributes->has('id')) {
      return false;
    }

    return $this->documentManager->getRepository($class)
      ->find($request->attributes->get('id'));
  }

  protected function findOneBy($class, Request $request, $options)
  {
    $criteria = array();
    $metadata = $this->documentManager->getClassMetadata($class);
    foreach ($request->attributes->all() as $key => $value) {
      if ($metadata->hasField($key)) {
        $criteria[$key] = $value;
      }
    }

    if (!$criteria) {
      return false;
    }

    return $this->documentManager->getRepository($class)->findOneBy($criteria);
  }

  public function supports(ConfigurationInterface $configuration)
  {
    /* if (null === $this->documentManager) { */
    /*   return false; */
    /* } */

    if (null === $configuration->getClass()) {
      return false;
    }

    $options = $configuration->getOptions();

    // Doctrine MongoDB Document?
    try {
      $this->documentManager->getClassMetadata($configuration->getClass());

      return true;
    } catch (MongoDBException $e) {
      return false;
    }
  }

}
