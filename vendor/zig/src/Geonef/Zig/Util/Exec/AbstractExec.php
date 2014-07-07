<?php

namespace Geonef\Zig\Util\Exec;

  /**
   * Abstract class for external command execution
   *
   * @package Zig
   * @subpackage Util
   * @author Okapi <okapi@lapatate.org>
   */
abstract class AbstractExec
{
  /**
   * Name of Zend_Log to use
   *
   * @var string
   */
  const LOG_NAME = 'exec';

  /**
   * Command path
   *
   * @var string
   */
  protected $_cmd;

  /**
   * Command arguments
   *
   * @var array
   */
  protected $_args = array();

  /**
   * Execution options (concrete class-dependant)
   *
   * @var array
   */
  protected $_options = array('redirectStderr' => false);

  protected $logger;

  public function __construct($cmd = null, $args = null,
                              /*Logger*/ $logger = null)
  {
    $this->logger = $logger;
    $this->_cmd = $cmd;
    if (is_array($args)) {
      $this->setArgs($args);
    }
  }

  /**
   * Run the command
   *
   * @param array $options
   * @return mixed
   */
  abstract public function execute($options = array());


  /**
   * Set command path
   *
   * It can also be set through the constructor, or create()
   *
   * @param string $command    path to command
   */
  public function setCommand($command)
  {
    $this->_cmd = $command;
  }

  /**
   * Set command arguments - public setter
   *
   * @param array $args
   * @return self    reference to self
   */
  public function setArgs($args)
  {
    $this->_args = $args;
    return $this;
  }

  public function setOptions($options = array())
  {
    $this->_options = array_merge($this->_options, $options);
  }

  /**
   * Return argument array - public getter
   *
   * @return array        array of arguments
   */
  protected function getArgs()
  {
    return $this->_args;
  }

  /**
   * Return argument array for use by Exec::execute()
   *
   * This getter can be overidden by child classes to provide
   * a dynamic construction of arguments
   *
   * @return array        array of arguments
   */
  protected function _getArgs()
  {
    return $this->_args;
  }

  /**
   * Get command line as it will be runned in the shell
   *
   * @return string    full command+args to pass to exec/system/passthru
   */
  public function getCommandLine()
  {
    return $this->_makeCommandLine();
  }

  protected function _makeCommandLine($options = array())
  {
    $cmd = $this->_cmd . ' '
      . $this->_makeShellArgs($this->_getArgs())
      . ($this->_options['redirectStderr'] ? ' 2>&1' : '');
    return $cmd;
  }

  /**
   * Convert shell arguments array to string
   *
   * @param array $args
   * @return string
   */
  protected function _makeShellArgs($args)
  {
    $cmd = '';
    foreach ($args as $n => $v) {
      $cmd .= ' '
        . (is_string($n) ? $n . '=' : '')
        . escapeshellarg($v);
    }
    return $cmd;
  }

}

