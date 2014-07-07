<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\PgLinkBundle\Document\Table;

class CreateTableCommand extends Command
{
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:pglink:create-table')
      ->addArgument('column-type', InputArgument::OPTIONAL , 'Type of initial column', 'varchar(255)')
      ->setHelp(self::HELP);
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $db = $this->container->get('zig_pglink.database');
    $columnType = $input->getArgument('column-type');
    $output->writeln(sprintf('DB name: <comment>%s</comment>', $db->getName()));
    $output->writeln(sprintf('Column type: <comment>%s</comment>', $columnType));
    $pglink = $this->container->get('zig_pglink.manager');
    $table = new Table();
    $table->createColumn($columnType);
    $table->commitDdl($this->container);
    $output->writeln(sprintf('Successfully created table <comment>%s</comment>', $table->getId()));
  }

  const HELP =
<<<EOT
    The <info>create-table</info> command FOR DEBUGGING ONLY creates
    a new table with a single initial column of the specified type.

    WARNING: the programme logic forbids the direct creation of tables.
             Everything should be manipulated through views.
             (<info>create-view-</info>* commands).
EOT;

}
