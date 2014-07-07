<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

class DropTableCommand extends AbstractTableCommand
{
  const TABLE_ARG_HELP = "ID of table to drop";

  protected function configure()
  {
    parent::configure();
    $this->setName('zig:pglink:drop-table');
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $table = $this->getTable($input, $output);
    $id = $table->getId();
    $table->drop();
    $table->commitDdl($this->container);
    $output->writeln(sprintf('Successfully dropped table <comment>%s</comment>', $id));
  }

  const HELP =
<<<EOT
    The <info>drop-table</info> command FOR DEBUGGING ONLY drops
    the given table immediately, with no interactive confirmation!

    WARNING: the programme logic forbids the direct dropping of tables.
             Everything should be manipulated through views.
             (See the <info>drop-view</info> command).
EOT;

}
