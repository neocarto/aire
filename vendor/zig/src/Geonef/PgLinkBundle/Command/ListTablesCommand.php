<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\PgLinkBundle\Document\Table;

class ListTablesCommand extends Command
{
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:pglink:list-tables')
      ->addArgument('query', InputArgument::OPTIONAL , 'JSON query')
      ->setHelp(self::HELP);
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $json = $input->getArgument('query');
    if ($json) {
      $query = json_decode($json, true);
      if (!$query) {
        throw new \Exception('invalid JSON: '.$json);
      }
    } else {
      $query = array();
    }
    $db = $this->container->get('zig_pglink.database');
    $output->writeln(sprintf('DB name: <comment>%s</comment>', $db->getName()));
    $output->writeln(sprintf('Query: <comment>%s</comment>', json_encode($query)));
    $tables = $db->findTables($this->container, $query);
    $output->writeln(sprintf('Found <comment>%s</comment> table(s).', $tables->count()));
    foreach ($tables as $table) {
      $output->writeln(sprintf('<comment>%s</comment>', $table->getId()));
    }
  }

  const HELP =
<<<EOT
    The <info>list-tables</info> command outputs a list of all
    tables from Mongo. Only the identifier is displayed.
EOT;

}
