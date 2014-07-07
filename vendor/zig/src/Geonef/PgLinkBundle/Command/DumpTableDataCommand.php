<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\PgLinkBundle\Document\Table;

class DumpTableDataCommand extends AbstractTableCommand
{
  const TABLE_ARG_HELP = "ID of table to drop";

  protected function configure()
  {
    parent::configure();
    $this->setName('zig:pglink:dump-table-data');
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $table = $this->getTable($input, $output);
    $data = $table->fetch($this->container);
    $output->writeln(sprintf('Got <comment>%d</comment> results.', count($data)));
    foreach ($data as $row) {
      $output->writeln('--------');
      foreach ($row as $n => $v) {
        $f = $v === null ? 'NULL' : $v;
        $output->writeln(sprintf('%s = <comment>%s</comment>', $n, $f));
      }
    }
  }

  const HELP =
<<<EOT
    The <info>insert-table-data</info> command FOR DEBUGGING ONLY
    dump the data rows from the given table.
EOT;

}
