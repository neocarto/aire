<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

class DescribeViewCommand extends AbstractViewCommand
{
  const VIEW_ARG_HELP = "ID of view to describe";

  protected function configure()
  {
    parent::configure();
    $this->setName('zig:pglink:describe-view');
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $db = $this->container->get('zig_pglink.database');
    $pglink = $this->container->get('zig_pglink.manager');
    $view = $this->getView($input, $output);
    $state = $view->isDdlDirty() ? 'dirty' : 'clean';
    $output->writeln(sprintf('  DDL state: <comment>%s</comment>', $state));
    foreach ($view->getColumns() as $column) {
      $output->writeln(sprintf('  Column <comment>%s</comment> ('
                               .'<comment>%s</comment>) "<comment>%s</comment>"',
                               $column->getName(), $column->getType($view),
                               $column->getTitle()));
    }
  }

  const HELP =
<<<EOT
    The <info>describe-view</info> inspect the given view and dump
    its state and list of columns.
EOT;

}
