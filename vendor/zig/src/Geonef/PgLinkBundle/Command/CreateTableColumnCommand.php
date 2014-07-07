<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\PgLinkBundle\Document\Table;

class CreateTableColumnCommand extends AbstractTableCommand
{
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:pglink:create-table-column')
      ->addArgument('column-type', InputArgument::OPTIONAL , 'Column type', 'varchar(255)');
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $table = $this->getTable($input, $output);
    $columnType = $input->getArgument('column-type');
    $output->writeln(sprintf('Column type : <comment>%s</comment>', $columnType));
    $column = $table->createColumn($columnType);
    $table->commitDdl($this->container);
    $output->writeln(sprintf('Successfully added column <comment>%s</comment> '
                             .'(<comment>%s</comment>) to table '
                             .'<comment>%s</comment>',
                             $column->getName(), $columnType, $table->getId()));
  }

  const HELP =
<<<EOT
    The <info>create-table-column</info> command FOR DEBUGGING ONLY creates
    a new column of the specified type on the given table.

    WARNING: the programme logic forbids the direct creation of table columns.
             Everything should be manipulated through views
             (<info>create-view-</info>* commands).
EOT;

}
