<?php

namespace Geonef\ZigBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\Zig\Util\String;

class InfoCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:info')
      ->setHelp(<<<EOT
<info>zig:info</info> provides general info about the application.
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $output->writeln(sprintf('INFO'));
    $shr = $this->getContainer()->getParameter('zig.install.shrinksafe');
    $version = $shr['build_version'];
    $output->writeln(sprintf('Version: %s', $version));
  }


}
