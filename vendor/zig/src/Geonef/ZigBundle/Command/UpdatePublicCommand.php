<?php

namespace Geonef\ZigBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\Zig\Util\FileSystem;

class UpdatePublicCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:install:update-public')
      ->addOption('init', null, InputOption::VALUE_OPTIONAL, 'Delete public dir and fully populate it again.', false)
      ->setHelp(<<<EOT
The <info>zig:install:update-public</info> command updates the "public" directory
from the various sources listed in the config as zig.install:public_mappings.
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $root_dir = $this->getContainer()->getParameter('kernel.root_dir');
    $cache_dir = $this->getContainer()->getParameter('kernel.cache_dir');
    $public_dir = FileSystem::getAbsolutePath
      ($this->getContainer()->getParameter('zig.install.public_dir'), $root_dir);
    if ($input->getOption('init')) {
      $output->writeln(sprintf('Deleting: <comment>%s</comment>', $public_dir));
      if (is_dir($public_dir)) {
        FileSystem::removeRecursive($public_dir);
      }
    }
    $mappings = $this->getContainer()->getParameter('zig.install.public_mappings');
    foreach ($mappings as $mapping) {
      $s_dir = FileSystem::getAbsolutePath($mapping['directory'], $root_dir);
      if (!is_dir($s_dir)) {
        throw new \Exception('source dir does not exist for symlink:'.$s_dir);
      }
      $l_dir = FileSystem::makePath($public_dir, $mapping['location']);
      $output->writeln(sprintf('Installing: <comment>%s</comment>', $s_dir));
      $output->writeln(sprintf('      into: <comment>%s</comment>', $l_dir));
      if (!is_dir($l_dir)) {
        mkdir($l_dir, 0755, true);
      }
      FileSystem::symlinkRecursive($s_dir, $l_dir, array('.svn'));
    }
  }

}
