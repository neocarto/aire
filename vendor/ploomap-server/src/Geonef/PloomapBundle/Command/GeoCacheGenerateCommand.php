<?php

namespace Geonef\PloomapBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

class GeoCacheGenerateCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('ploomap:geocache:generate')
      ->setDescription("Dump mod-geocache configuration")
      ->setHelp(<<<EOT
This command dumps the mod-geocache configuration from map settings and displays
stored in the database, in XML format.
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $cache = $this->getContainer()->get('geonef.ploomap.geocache');
    $content = $cache->buildCacheConfig();
    echo $content;
    /* foreach (explode("\n", $content) as $line) { */
    /*   $output->writeln($line); */
    /* } */
  }

}
