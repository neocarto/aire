<?php

namespace Geonef\ZigBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Geonef\Zig\Util\FileSystem;
use Geonef\Zig\Util\Exec;


class BuildOpenLayersCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:install:build-openlayers')
      //->addOption('em', null, InputOption::PARAMETER_OPTIONAL, 'The entity manager to use for this command.')
      ->setHelp(<<<EOT
The <info>zig:install:build-openlayers</info> command runs the python script
from the OpenLayers build directory to make the unique compressed JS file
of OpenLayers.
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $public_dir = $this->absPath($this->getContainer()->getParameter('zig.install.public_dir'));
    $build_dir = FileSystem::makePath($public_dir, 'lib/openlayers/build');
    if (!is_dir($build_dir)) {
      throw new \Exception('OpenLayers build dir does not exist: ' . $build_dir);
    }
    chdir($build_dir);
    $output->writeln(sprintf('chdir: <comment>%s</comment>', $build_dir));
    $cmd = new Exec('./build.py');
    $output->writeln(sprintf('Running: <comment>%s</comment>', $cmd->getCommandLine()));
    $cmd->execute(array('output' => 'passthru'));
    $file = FileSystem::makePath($build_dir, 'OpenLayers.js');
    if (!file_exists($file)) {
      throw new \Exception('OpenLayers compressed file has not been created: ' . $file);
    }
    $target = FileSystem::makePath($public_dir, 'lib', 'package', 'openlayers.js');
    $output->writeln(sprintf('Generating: <comment>%s</comment>', $target));
    file_put_contents($target, "dojo.provide('package.openlayers');\n");
    $js = file_get_contents($file);
    file_put_contents($target, $js, FILE_APPEND);
    // proj 4
    $proj = FileSystem::makePath($public_dir, 'lib', 'proj4js', 'lib', 'proj4js-compressed.js');
    if (file_exists($proj)) {
      $target = FileSystem::makePath($public_dir, 'lib', 'package', 'proj4js.js');
      $output->writeln(sprintf('Generating: <comment>%s</comment>', $target));
      file_put_contents($target, "dojo.provide('package.proj4js');\n");
      $js = file_get_contents($proj);
      file_put_contents($target, $js, FILE_APPEND);
    }

    $output->writeln("Done.");
  }

  protected function absPath($path)
  {
    $root_dir = $this->getContainer()->getParameter('kernel.root_dir');
    return FileSystem::getAbsolutePath($path, $root_dir);
  }

}
