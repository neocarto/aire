<?php

namespace Geonef\ZigBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

class ModelInfoMongoCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:model:info-mongo')
      ->setHelp(<<<EOT
                <info>zig:model:info-mongo</info> shows some useful information about Doctrine MongoDB configuration.
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $output->writeln(sprintf('Information about Doctrine MongoDB'));
    $manager = $this->getContainer()->get('doctrine.odm.mongodb.document_manager');
    $config = $manager->getConfiguration();
    foreach (array(/*'Environment',*/ 'ProxyNamespace', 'ProxyDir',
            'DefaultDB'/*, 'DBPrefix'*/) as $p) {
      $value = $config->{'get'.$p}();
      $output->writeln(sprintf('%s = <comment>%s</comment>', $p, $value));
    }
    $metadataDriver = $config->getMetadataDriverImpl();
    $output->writeln(sprintf('metadata driver impl class = <comment>%s</comment>', get_class($metadataDriver)));
    if (method_exists($metadataDriver, 'getDrivers')) {
      foreach ($metadataDriver->getDrivers() as $dr) {
        $output->writeln(sprintf('| -> driver impl class = <comment>%s</comment>', get_class($dr)));
        if (method_exists($dr, 'getPaths')) {
          $output->writeln(sprintf('metadata driver paths = <comment>%s</comment>', implode(', ', $dr->getPaths())));
        }
      }
    }
    if (method_exists($metadataDriver, 'getPaths')) {
      $output->writeln(sprintf('metadata driver paths = <comment>%s</comment>', implode(', ', $metadataDriver->getPaths())));
    }
    //var_dump($metadataDriver);
  }

}
