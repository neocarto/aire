<?php

namespace Geonef\ZigBundle\Form;

use FOS\UserBundle\Form\Type\RegistrationFormType as BaseRegistrationFormType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilder;


class RegistrationFormType extends BaseRegistrationFormType
{

  public function buildForm(FormBuilder $builder, array $options)
  {
    parent::buildForm($builder, $options);
    $builder->add('subscriptionCode');
  }

  public function getDefaultOptions(array $options)
  {
    return array('csrf_protection' => false);
  }

}
