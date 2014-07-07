<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

abstract class AbstractViewCommand extends Command
{
  const VIEW_ARG_HELP = "Related view";

  protected function configure()
  {
    parent::configure();
    $this->addArgument('view', InputArgument::REQUIRED , static::VIEW_ARG_HELP);
    $this->setHelp(static::HELP);
  }

  protected function getView(InputInterface $input, OutputInterface $output)
  {
    $db = $this->container->get('zig_pglink.database');
    $output->writeln(sprintf('Database: <comment>%s</comment>', $db->getName()));
    $viewId = $input->getArgument('view');
    $dm = $this->container->get('doctrine.odm.mongodb.documentManager');
    $repos = $dm->getRepository('Geonef\PgLinkBundle\Document\View');
    $view = $repos->find($viewId);
    if (!$view) {
      throw new \Exception('view not found: '.$viewId);
    }
    $output->writeln(sprintf('View: <comment>%s</comment>', $view->getId()));
    return $view;
  }

  const HELP = "";

}
