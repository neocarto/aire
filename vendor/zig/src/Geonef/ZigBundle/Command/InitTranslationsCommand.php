<?php

namespace Geonef\ZigBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Stof\DoctrineExtensionsBundle\Document\Translation as TranslationDocument;
class InitTranslationsCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:init-translations')
      ->addArgument('class', InputArgument::REQUIRED, "Document class")
      ->addArgument('property', InputArgument::REQUIRED, "property name")
      ->addArgument('locale', InputArgument::REQUIRED, "Locale")
      ->setHelp(<<<EOT
The <info>zig:init-translations</info> command create translation entries
in the Translation repository for given languages and document class,
based on the non i18n property value.

This operation should be made once, before fields are made "Translatable".
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    //$this->container->get('session')->setLocale($locale);
    foreach (array('class', 'property', 'locale') as $n) {
      $$n = $input->getArgument($n);
    }
    $translatable = $this->getContainer()->get('stof_doctrine_extensions.listener.translatable');
    $translatable->setTranslatableLocale($locale);
    $translatable->setSkipOnLoad(true); // Very important!
    $dm = $this->getContainer()->get('doctrine.odm.mongodb.documentManager');
    $objs = $dm->getRepository($class)->findAll();
    $output->writeln(sprintf('Found <comment>%d</comment> objects in class <comment>%s</comment>',
                             count($objs), $class));
    $count = $count2 = 0;
    foreach ($objs as $obj) {
      if ($obj instanceof $class) {
        $count2++;
        $count += $this->processObject($obj, $property, $locale) ? 1 : 0;
      }
    }
    $output->writeln(sprintf('<comment>%d</comment> objects were concerned', $count2));
    $output->writeln(sprintf('Created <comment>%d</comment> translations', $count));
    if ($count) {
      $output->writeln('Flushing...');
    }
    $dm->flush();
  }

  protected function processObject($obj, $property, $locale)
  {
    if ($obj->$property == '') { return; }
    $translatable = $this->getContainer()->get('stof_doctrine_extensions.listener.translatable');
    $class = 'Stof\\DoctrineExtensionsBundle\\Document\Translation';
    $dm = $this->getContainer()->get('doctrine.odm.mongodb.documentManager');
    $qb = $dm->getRepository($class)->createQueryBuilder();;
    $q = $qb->field('objectClass')->equals(get_class($obj))
      ->field('foreignKey')->equals($obj->getId())
      ->field('field')->equals($property)
      ->field('locale')->equals($locale)
      ->getQuery();
    if (count($q->execute()->toArray()) == 0) {
      $trans = new TranslationDocument;
      $trans->setField($property);
      $trans->setObjectClass(get_class($obj));
      $trans->setForeignKey($obj->getId());
      $trans->setLocale($locale);
      $trans->setContent($obj->$property);
      $dm->persist($trans);
      return true;
    }
    return false;
  }

}
