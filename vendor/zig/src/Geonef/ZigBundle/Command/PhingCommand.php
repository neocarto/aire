<?php

namespace Geonef\ZigBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\Zig\Util\FileSystem;
use Phing;

class PhingCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('phing')
      ->setDescription("Run Phing commands from the Symfony app environment")
      ->addArgument('args', InputArgument::OPTIONAL | InputArgument::IS_ARRAY, 'Arguments to Phing')
      ->setHelp(<<<EOT
                The <info>phing</info> command runs phing, forwarding the arguments
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    global $symfonyContainer;
    //$output->writeln(sprintf('Hello <comment>!</comment>'));
    $args = $input->getArgument('args');
    $this->init();
    if (isset($args[0]) && $args[0] == 'help') {
      Phing::printUsage();
      return;
    }
    $symfonyContainer = $this->getContainer();
    Phing::fire($args);
    Phing::shutdown();
  }

  protected function init()
  {
    $dir = $this->getContainer()->getParameter('kernel.root_dir');
    chdir($dir);
    ini_set('include_path', get_include_path().PATH_SEPARATOR.dirname(__DIR__).'/Resources');
    //$path = $this->getContainer()->getParameter('zig.phing_path');
    $path = 'phing/Phing.php';
    require $path;
    Phing::startup();
  }


}
