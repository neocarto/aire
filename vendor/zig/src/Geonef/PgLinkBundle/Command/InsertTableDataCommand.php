<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\PgLinkBundle\Document\Table;

class InsertTableDataCommand extends AbstractTableCommand
{
  const TABLE_ARG_HELP = "ID of table to drop";

  protected function configure()
  {
    parent::configure();
    $this->setName('zig:pglink:insert-table-data')
      ->addArgument('json', InputArgument::REQUIRED , 'JSON object');
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $json = $input->getArgument('json');
    $data = json_decode($json, true);
    if (!$data) {
      throw new \Exception('invalid JSON: '.$json);
    }
    $table = $this->getTable($input, $output);
    $id = $table->insertRow($this->container, $data);
    $output->writeln(sprintf('Successfully insert row <comment>%s</comment> '
                             .'into table <comment>%s</comment>',
                             $id, $table->getId()));
  }

  const HELP =
<<<EOT
    The <info>insert-table-data</info> command FOR DEBUGGING ONLY
    inserts a data row into the given table.

    WARNING: the programme logic forbids direct access to tables.
             Everything should be manipulated through views.
             (See <info>insert-view-data</info>).
EOT;

}
