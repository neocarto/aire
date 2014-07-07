<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

class DropViewCommand extends AbstractViewCommand
{
  const VIEW_ARG_HELP = "ID of view to drop";

  protected function configure()
  {
    parent::configure();
    $this->setName('zig:pglink:drop-view');
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $view = $this->getView($input, $output);
    $id = $view->getId();
    $view->drop();
    $view->commitDdl($this->container);
    $output->writeln(sprintf('Successfully dropped view <comment>%s</comment>', $id));
  }

  const HELP =
<<<EOT
    The <info>drop-view</info> command FOR DEBUGGING ONLY drops
    the given view immediately, with no interactive confirmation!
EOT;

}
