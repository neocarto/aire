<?php

namespace Geonef\ZigBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Geonef\Zig\Util\FileSystem;
use Geonef\Zig\Util\ArrayAssoc;

/**
 * Remove public files/symlinks whire not in config "publicPaths"
 *
 * @author Okapi
 */
class CleanPublicCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:app:clean-public')
      ->setDescription("Clean public files which are not explicetely defined")
      ->setHelp(<<<EOT

This command removes public files/symlinks which are not in config "publicPaths"
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $am = $this->getContainer()->get('zig.app.manager');
    $count = $am->cleanPublic();
    $output->writeln("Cleaning complete. Kept <comment>$count</comment> files.");
  }

}
