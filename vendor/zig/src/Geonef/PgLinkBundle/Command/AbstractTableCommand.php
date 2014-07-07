<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\PgLinkBundle\Document\Table;

abstract class AbstractTableCommand extends Command
{
  const TABLE_ARG_HELP = "Related table";

  protected function configure()
  {
    parent::configure();
    $this->addArgument('table', InputArgument::REQUIRED , static::TABLE_ARG_HELP);
    $this->setHelp(static::HELP);
  }

  protected function getTable(InputInterface $input, OutputInterface $output)
  {
    $db = $this->container->get('zig_pglink.database');
    $output->writeln(sprintf('Database: <comment>%s</comment>', $db->getName()));
    $tableId = $input->getArgument('table');
    $dm = $this->container->get('doctrine.odm.mongodb.documentManager');
    $repos = $dm->getRepository('Geonef\PgLinkBundle\Document\Table');
    $table = $repos->find($tableId);
    if (!$table) {
      throw new \Exception('table not found: '.$tableId);
    }
    $output->writeln(sprintf('Table: <comment>%s</comment>', $table->getId()));
    return $table;
  }

  const HELP = "";

}
