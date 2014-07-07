<?php

namespace Geonef\ZigBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

/**
 * ?? Is it used??
 */
class TaskRunnerCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:task:execute')
      ->addOption('id', null, InputOption::VALUE_REQUIRED, 'Task ID', false)
      ->setHelp(<<<EOT
The <info>zig:tastk:runner</info> command loops into running
tasks to do.
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $dm = $this->getContainer()->get('doctrine.odm.mongodb.documentManager');
    $id = $input->getOption('id');
    $class = 'Geonef\ZigBundle\Document\Task';
    $task = $dm->find($class, $id);
    if (!$task) {
      throw new \Exception('Task not found: '.$id);
    }
    $output->writeln(sprintf('executing: <comment>%s</comment>', get_class($task)));
    $task->execute($this->getContainer());
    //$dm->remove($task);
    //$dm->flush();
  }

}
