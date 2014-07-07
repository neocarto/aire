<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

class CreateViewColumnCommand extends AbstractViewCommand
{
  const VIEW_ARG_HELP = "ID of view on which to create the column";

  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:pglink:create-view-column')
      ->addArgument('title', InputArgument::REQUIRED , 'Title of column to create')
      ->addArgument('expression', InputArgument::OPTIONAL , 'Title of initial column')
      ->addOption('type', null, InputOption::VALUE_OPTIONAL,
                  'Type of column: "expression", "varchar", ...', 'varchar(255)');
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $db = $this->container->get('zig_pglink.database');
    $pglink = $this->container->get('zig_pglink.manager');
    $view = $this->getView($input, $output);
    $type = $input->getOption('type');
    $title = $input->getArgument('title');
    if ($type == 'expression') {
    } else {
      $view->createRealColumn($title, $type);
    }
    $view->commitDdl($this->container);
    $output->writeln(sprintf('Successfully created view <comment>%s</comment> '
                             .'out of table <comment>%s</comment>',
                             $view->getId(), $table->getId()));
  }

  const HELP =
<<<EOT
    The <info>describe-view</info> inspect the given view and dump
    its state and list of columns.
EOT;

}
