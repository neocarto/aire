<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

class CreateTableViewCommand extends AbstractTableCommand
{
  const TABLE_ARG_HELP = "ID of table for which to create the view";

  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:pglink:create-table-view')
      ->addArgument('title', InputArgument::REQUIRED, 'Title of view to create')
      ->setHelp(self::HELP);
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $table = $this->getTable($input, $output);
    $title = $input->getArgument('title');
    $output->writeln(sprintf('View title: <comment>%s</comment>', $title));
    $view = $table->createView();
    $view->setTitle($title);
    $view->commitDdl($this->container);
    $output->writeln(sprintf('Successfully created view <comment>%s</comment> '
                             .'out of table <comment>%s</comment>',
                             $view->getId(), $table->getId()));
  }

  const HELP =
<<<EOT
    The <info>create-table-view</info> command creates a new view out of
    the given table.

    WARNING: the programme logic forbids direct user reference to tables.
             Everything should be manipulated through views.
             (See the <info>create-view-ref</info> command).
EOT;

}
