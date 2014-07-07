<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\PgLinkBundle\Document\Table;

class DropTableColumnCommand extends AbstractTableCommand
{
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:pglink:drop-table-column')
      ->addArgument('column-name', InputArgument::REQUIRED , 'Column name')
      ->addOption('force', null, InputOption::VALUE_OPTIONAL, 'Drop the table if needed', 'no');
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $table = $this->getTable($input, $output);
    $columnName = $input->getArgument('column-name');
    $output->writeln(sprintf('Column name : <comment>%s</comment>',
                             $columnName));
    if ($table->getColumns()->count() == 1 &&
        $input->getOption('force') != 'yes') {
      $output->writeln(sprintf("Column <comment>%s</comment> is the last "
                               ."remaining field on table <comment>%s</comment>",
                               $columnName, $table->getId()));
      $output->writeln("This will drop the table itself. Specify the "
                       ."<comment>--force=yes</comment> option to do it anyway!");
      return;
    }
    $table->dropColumn($columnName);
    $table->commitDdl($this->container);
    $output->writeln(sprintf('Successfully dropped column <comment>%s</comment> '
                             .'from table <comment>%s</comment>',
                             $columnName, $table->getId()));
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
