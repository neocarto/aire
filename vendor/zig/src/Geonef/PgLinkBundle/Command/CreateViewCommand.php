<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

class CreateViewCommand extends Command
{
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:pglink:create-view')
      ->addArgument('title', InputArgument::REQUIRED , 'Title of view to create')
      ->addArgument('column-title', InputArgument::REQUIRED , 'Title of initial column')
      ->addOption('table', null, InputOption::VALUE_OPTIONAL, 'Link the view to the given table')
      ->setHelp(self::HELP);
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $db = $this->container->get('zig_pglink.database');
    $table = $input->getArgument('table');

    $viewTitle = $input->getArgument('title');
    $columnTitle = $input->getArgument('column-title');
    $columnType = $input->getArgument('column-type');
    $output->writeln(sprintf('DB name = <comment>%s</comment>', $db->getName()));
    $output->writeln(sprintf('View title = <comment>%s</comment>', $viewTitle));
    $output->writeln(sprintf('Column title = <comment>%s</comment>', $columnTitle));
    $output->writeln(sprintf('Column type = <comment>%s</comment>', $columnType));
    $pglink = $this->container->get('zig_pglink.manager');
    $view = $pglink->createSeparateView();
    $table = $view->getTable();
    $table->createColumn('varchar(66)');
    $table->createColumn('integer');
    $table->commitDdl($this->container);
    $output->writeln('OK.');
    /* $view->setTitle($viewTitle); */
    /* $view->createRealColumn($columnTitle, $columnType); */
    /* $view->commitDdl($this->container); */
    /* $output->writeln(sprintf('Successfully created view <comment>%s</comment>', $view->getId())); */
  }

  const HELP =
<<<EOT
The <info>create-view</info> command creates a new standalone view
with a single initial column with the specified type.
EOT;

}
