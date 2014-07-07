<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

class TestCommand extends Command
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:pglink:test')
      ->setHelp(<<<EOT
                <info>zig:pglink:test</info> is for DEV only
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $output->writeln(sprintf('TEST'));
    $db = $this->container->get('zig_pglink.database');
    $output->writeln(sprintf('name = <comment>%s</comment>', $db->getName()));
    /* foreach (array('database', 'user', 'password') as $p) { */
    /*   //$value = */
    /*   $output->writeln(sprintf('%s = <comment>%s</comment>', $p, $value)); */
    /* } */
  }

}
