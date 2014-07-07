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

class TestCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:test')
      ->addOption('opt', null, InputOption::VALUE_OPTIONAL, 'Test option.', false)
      ->setHelp(<<<EOT
<info>zig:test</info> is a simple test.
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $output->writeln(sprintf('TEST'));
    $t = $this->getContainer()->get('geonef_zig.static_cache.manager');
    var_dump($t->getAllDependencies());
    return;
    $dm = $this->getContainer()->get('doctrine.odm.mongodb.documentManager');
    $dm->getClassMetadata('kjhkjh:kjh');exit;
    // 4df1563f960c9bcf4c010000: 1st doc (works)
    //$doc = $dm->find('Geonef\\PloomapBundle\\Document\\Map', '4df1563f960c9bcf4c010000'); // OK
    $doc = $dm->find('Geonef\\PloomapBundle\\Document\\Map', '4d253e88960c9b5469050000'); // Exception
    //$doc->name = $doc->name.'+';
    print "new doc name: ";
    var_dump($doc->name);
    //$doc->clearInfoCache($this->getContainer());
    //$dm->flush();
    /* $z = $doc->zz($this->getContainer()); */
    /* print "z = ".$z."\n"; */
    $dm->flush();
    $output->writeln(sprintf('Flushed'));
  }


}
