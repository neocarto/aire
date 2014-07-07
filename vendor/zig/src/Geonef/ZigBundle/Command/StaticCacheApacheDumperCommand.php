<?php

namespace Geonef\ZigBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

//use Geonef\PloomapBundle\Document\Template\SvgMap;
use Geonef\Zig\Util\CssParser\CssParser;
use Symfony\Component\CssSelector\CssSelector;

class StaticCacheApacheDumperCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setDefinition(array(
                            //new InputArgument('script_name', InputArgument::OPTIONAL, 'The script name of the application\'s front controller.'),
                            //new InputOption('base-uri', null, InputOption::VALUE_REQUIRED, 'The base URI'),
        ))
      ->setName('zig:static-cache:dump-apache')
      ->setDescription('Dumps Apache rewrite rules for configured cached routes')
      ->setHelp(<<<EOT
The <info>zig:static-cache:dump-apache</info> dumps the Apache rewrite rules
to get the static cache working.
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    //$output->writeln(sprintf('TEST'));
    $manager = $this->getContainer()->get('geonef_zig.static_cache.manager');
    //var_dump($t->getRouteCacheParams('aire_collection_visu_i18n'));
    $str = $manager->getAllApacheRewrite($this->getContainer()->get('router'));

    $output->writeln($str, OutputInterface::OUTPUT_RAW);
  }


}
