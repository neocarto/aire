<?php

namespace Geonef\Zig\Util\Exec;

use Geonef\Zig\Util\Exec\Abstract;

  /**
   * Execution of external processes, with file descriptor management
   *
   * Uses PHP's proc_* functions
   *
   * Example:
   * 		$cmd = new Geonef\Zig\Util\Exec\Proc('/path/to/command', array('arg1','arg2'));
   * 		$cmd->defineDescriptor(0, array('pipe', 'r'));
   * 		$cmd->execute();
   * 		fwrite($cmd->getPipe(0), 'some content to send to commands STDIN');
   * 		fclose($cmd->getPipe(0));
   * 		$cmd->wait();
   *
   * @package Zig
   * @subpackage Util
   * @author Okapi <okapi@lapatate.org>
   * @see PHP function: proc_open()
   */
class Proc extends Abstract
{
  /**
   * Process, created by proc_open()
   *
   * @var $process Resource
   */
  protected $process;

  /**
   * Pipes, ref given to proc_open()
   *
   * @var $pipes array
   */
  protected $pipes = array();

  /**
   * Stream descriptors, given to proc_open()
   *
   * @var $descriptors array
   */
  protected $descriptors = array();

  /**
   * Define descriptor for command execution
   *
   * 0 is STDIN, 1 is STDOUT, 2 is STDERR
   * Examples:
   * 		$cmd->defineDescriptor(0, array('pipe', 'r'));
   *
   * @param integer $fd
   * @param array $def
   */
  public function defineDescriptor($fd, $def)
  {
    $this->descriptors[$fd] = $def;
  }

  /**
   * Execute command, does not wait for command return
   *
   * @param array $options
   */
  public function execute($options = array())
  {
    $this->setOptions($options);
    $cmd = $this->_makeCommandLine();
    $options = $this->_options;
    _log(self::LOG_NAME)->notice('proc_open(): ' . $cmd);
    $this->process = proc_open($cmd, $this->descriptors, $this->pipes);

  }

  /**
   * Get pipe stream for given descriptor
   *
   * @param integer $descriptor
   */
  public function getPipe($descriptor)
  {
    return $this->pipes[$descriptor];
  }

  /**
   * Wait for the process to end
   */
  public function wait()
  {
    proc_close($this->process);
  }

  /**
   * Kill process
   *
   * @param integer $signal
   */
  public function kill($signal = 15)
  {
    proc_terminate($this->process, $signal);
  }
}
