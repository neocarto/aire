<?php

namespace Geonef\PloomapBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\Zig\Util\FileSystem;

class MapListAllCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('ploomap:map:list-all')
      ->setHelp(<<<EOT
The <info>ploomap:map:list-all</info> command dumps the list
of all maps from the DB.
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $dm = $this->getContainer()->get('doctrine.odm.mongodb.documentManager');
    $repos = $dm->getRepository('Geonef\PloomapBundle\Document\Map');
    $coll = $repos->findAll();
    foreach ($coll as $map) {
      $output->writeln(sprintf("Map: <info>%s</info>...",
                               $map->getId()));
    }
    $output->writeln(sprintf("<info>%d</info> maps found. ", count($coll)));
  }

}
