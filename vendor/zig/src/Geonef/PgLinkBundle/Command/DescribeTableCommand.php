<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\PgLinkBundle\Document\Table;

class DescribeTableCommand extends AbstractTableCommand
{
  const TABLE_ARG_HELP = "ID of table to describe";

  protected function configure()
  {
    parent::configure();
    $this->setName('zig:pglink:describe-table');
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $db = $this->container->get('zig_pglink.database');
    $pglink = $this->container->get('zig_pglink.manager');
    $table = $this->getTable($input, $output);
    $state = $table->isDdlDirty() ? 'dirty' : 'clean';
    $output->writeln(sprintf('  DDL state: <comment>%s</comment>', $state));
    foreach ($table->getColumns() as $column) {
      $output->writeln(sprintf('  Column <comment>%s</comment> '
                               .'<comment>%s</comment> ',
                               $column->getName(), $column->getType()));
    }
  }

  const HELP =
<<<EOT
    The <info>describe-table</info> inspect the table and dump
    its state and list of columns.
EOT;

}
