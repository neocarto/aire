<?php

//require_once "phing/Task.php";

use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\StringInput;
use Symfony\Component\Console\Output\ConsoleOutput;

class SymfonyTask extends Task {

  /**
   * @var string
   */
  protected $name;

  /**
   * @var string
   */
  protected $args = '';


  public function setCommand($name)
  {
    $this->name = $name;
  }

  public function setArgs($args)
  {
    $this->args = $args;
  }

  public function init()
  {
  }

  /**
   * The main entry point method.
   */
  public function main() {
    global $symfonyContainer;

    $kernel = $symfonyContainer->get('kernel');
    $class = get_class($kernel);
    //$application = new Application(new $class('dev', true));
    $application = new Application($kernel);
    //$application->run();
    //$this->command = $application->find($name);
    $input = new StringInput($this->name.' '.$this->args);
    $output = new ConsoleOutput();
    $application->doRun($input, $output);
  }

}
