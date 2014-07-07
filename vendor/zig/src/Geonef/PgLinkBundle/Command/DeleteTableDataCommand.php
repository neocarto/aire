<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\PgLinkBundle\Document\Table;

class DeleteTableDataCommand extends AbstractTableCommand
{
  const TABLE_ARG_HELP = "ID of table to drop";

  protected function configure()
  {
    parent::configure();
    $this->setName('zig:pglink:delete-table-data')
      ->addArgument('id', InputArgument::REQUIRED,
                    'Identifier of row to delete');
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $id = $input->getArgument('id');
    $table = $this->getTable($input, $output);
    $num = $table->deleteRow($this->container, $id);
    $output->writeln(sprintf('Successfully deleted <comment>%s</comment> row(s) '
                             .'from table <comment>%s</comment>',
                             $num, $table->getId()));
  }

  const HELP =
<<<EOT
    The <info>delete-table-data</info> command FOR DEBUGGING ONLY
    delete a data row from the given table.

    WARNING: the programme logic forbids direct access to tables.
             Everything should be manipulated through views.
             (See <info>delete-view-data</info>).
EOT;

}
