<?php

namespace Geonef\PgLinkBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Geonef\PgLinkBundle\Document\Table;

class RecoverTableCommand extends AbstractTableCommand
{
  const TABLE_ARG_HELP = "ID of table to recover";

  protected function configure()
  {
    parent::configure();
    $this->setName('zig:pglink:recover-table');
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $db = $this->container->get('zig_pglink.database');
    $pglink = $this->container->get('zig_pglink.manager');
    $table = $this->getTable($input, $output);
    $id = $table->getId();
    if (!$table->isDdlDirty()) {
      $output->writeln(sprintf('Table <comment>%s</comment> is clean.', $id));
      return;
    }
    $output->writeln(sprintf('Table <comment>%s</comment> is dirty. Recovering...', $id));
    $table->recover($this->container);
    $table->commitDdl($this->container);
    $output->writeln(sprintf('Successfully recovered table <comment>%s</comment>', $id));
  }

  const HELP =
<<<EOT
    The <info>recover-table</info> command will check the coherence
    between the PG database and the Mongo document.
    In case it is not coherent, fix it.
EOT;

}
