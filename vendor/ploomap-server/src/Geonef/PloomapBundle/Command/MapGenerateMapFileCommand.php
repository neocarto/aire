<?php

namespace Geonef\PloomapBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\Zig\Util\FileSystem;

class MapGenerateMapFileCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('ploomap:map:generate-map-file')
      ->addOption('map', null, InputOption::VALUE_REQUIRED /*InputOption::PARAMETER_OPTIONAL*/, 'Map ID', false)
      ->setHelp(<<<EOT
The <info>ploomap:map:generate-map-file</info> command fetch the given map
and displays its generated MapFile content.
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $id = $input->getOption('map');
    $dm = $this->getContainer()->get('doctrine.odm.mongodb.documentManager');
    $map = $dm->find('Geonef\PloomapBundle\Document\Map', $id);
    if (!$map) {
      throw new \Exception('map not found: '.$id);
    }
    $map->clearBuild($this->getContainer());
    $mapString = $map->getMapString($this->getContainer());
    foreach (explode("\n", $mapString) as $line) {
      $output->writeln($line);
    }

  }

}
