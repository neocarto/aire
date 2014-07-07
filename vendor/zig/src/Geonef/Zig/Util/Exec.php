<?php

namespace Geonef\Zig\Util;
use Geonef\Zig\Util\Exec\AbstractExec;

  /**
   * Execution of external processes
   *
   * This class provide convenient methods to set a command path, its arguments,
   * and control its execution.
   *
   * To handle streams (like popen(), proc_open()...),
   * use Exec\Proc
   *
   * @package	Zig
   * @subpackage Util
   * @author Okapi <okapi@lapatate.org>
   */
class Exec extends AbstractExec
{
  protected $_options = array(
                              //'output' => 'system',
                              'logFailures' => true,
                              'exceptionOnFailure' => true,
                              'redirectStderr' => true,
                              'output' => 'dumpOnFailure' // or 'system', or 'passthru', or 'get'
                              );


  /**
   * Static way to instanciate the class
   *
   * @param string $cmd
   * @param array $args
   * @return self
   */
  static public function create($cmd = null, $args = null)
  {
    return new self($cmd, $args);
  }

  /**
   * Run the command
   *
   */
  public function execute($options = array())
  {
    $this->setOptions($options);
    $ret = null;
    $cmd = $this->_makeCommandLine();
    $options = $this->_options;
    if ($this->logger) { $this->logger->info('exec: running: '.$cmd); }
    //_log(self::LOG_NAME)->notice('command: ' . $cmd);
    switch ($options['output']) {
    case 'system':
      $output = array(system($cmd, $ret));
      break;
    case 'passthru':
      passthru($cmd, $ret);
      break;
    case 'none':
    case 'get':
    default:
      exec($cmd, $output, $ret);
    }
    if (isset($output)) {
      $this->_output = $output;
    }
    if ($ret != 0) {
      if ($this->logger) { $this->logger->err('exec: error code:  '.$ret); }
      if ($options['logFailures'] || $options['exceptionOnFailure']) {
        if (isset($output)) {
          foreach ($output as $line) {
            if ($this->logger) { $this->logger->info('exec: output:  '.$line); }
          }
          if ($options['exceptionOnFailure']) {
            throw new \Exception('exec: command failed: '.$cmd, $ret);
          }
        } else {
          if ($this->logger) { $this->logger->warn('exec: no output saved'); }
        }
      }
    }
    if ($options['output'] === 'dumpOnFailure' && $ret !== 0) {
      throw new \Exception
        ("output: ". implode("<br/>\n", $output), $ret);
    }
    return $ret;
  }

  public function getOutput()
  {
    return $this->_output;
  }

}
