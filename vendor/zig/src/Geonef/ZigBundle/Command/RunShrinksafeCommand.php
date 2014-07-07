<?php

namespace Geonef\ZigBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Geonef\Zig\Util\FileSystem;
use Geonef\Zig\Util\Exec;

/**
 * Make a shrinksafe build
 *
 * @package Zig
 * @subpackage ZigBundle
 * @author Okapi
 * @see http://docs.dojocampus.org/build/buildScript
 * @see http://docs.dojocampus.org/build/profiles
 */
class RunShrinksafeCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:install:run-shrinksafe')
      //->addOption('em', null, InputOption::PARAMETER_OPTIONAL, 'The entity manager to use for this command.')
      ->setHelp(<<<EOT
The <info>zig:install:run-shrinksafe</info> run the dojo shrinksafe program
to build compile JS files according to the "layer" definition.
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $config = $this->getContainer()->getParameter('zig.install.shrinksafe');
    foreach (array('profileData', 'buildscripts_dir', 'release_name',
                   'release_dir', 'build_version') as $n) {
      $$n = $config[$n];
    }
    if ($this->getContainer()->getParameter('kernel.environment') == 'dev') {
      $build_version .= '.dev';
    }
    //$profile = $this->absPath($profile);
    $release_dir = $this->absPath($release_dir);
    $buildscripts_dir = $this->absPath($buildscripts_dir);
    $x_dir = FileSystem::makePath($release_dir, $release_name);
    /*if (is_dir($x_dir)) { // will be done by shrinksafe
      $output->writeln(sprintf('rm: <comment>%s</comment>', $x_dir));
      FileSystem::removeRecursive($x_dir);
      }*/
    if (!is_dir($release_dir)) {
      throw new \Exception('release dir does not exist: '.$release_dir);
    }
    if (!is_dir($buildscripts_dir)) {
      throw new \Exception('buildscripts dir does not exist: ' . $buildscripts_dir);
    }
    $profile = $this->buildProfile($profileData);
    $output->writeln(sprintf('Generated Shrinksafe profile: <comment>%s</comment>', $profile));
    chdir($buildscripts_dir);
    $output->writeln(sprintf('chdir: <comment>%s</comment>', $buildscripts_dir));
    $options = array('action' => 'release',
                     'releaseName' => $release_name,
                     'profileFile' => $profile,
                     'releaseDir' => $release_dir,
                     'version' => $build_version,
                     'copyTests' => 'false');
    //if ('prod' == $this->getContainer()->getParameter('kernel.environment')) {
    $options['cssOptimize'] = 'comments';
    //}
    $cmd = new Exec('./build.sh', $options);
    $output->writeln(sprintf('Running: <comment>%s</comment>', $cmd->getCommandLine()));
    $cmd->execute(array('output' => 'passthru'));
    $packages = array('application', 'workspace', 'admin', 'print', 'home', 'collection', 'carnets');
    foreach ($packages as $n) {
      $file = FileSystem::makePath($release_dir, $release_name, $n.'.js');
      if (file_exists($file)) {
        $output->writeln(sprintf('Fixing: <comment>%s</comment>', $file));
        $str = file_get_contents($file);
        $str = str_replace('dojo.i18n._preloadLocalizations("dojo.nls."',
                           'dojo.i18n._preloadLocalizations("nls.'.$n.'"', $str);
        file_put_contents($file, $str);
      }
    }
    $output->writeln('');
    $output->write(sprintf('Fixing: <comment>NLS</comment>... '));
    $nlsPath = FileSystem::makePath($release_dir, $release_name, 'nls');
    $files = scandir($nlsPath);
    foreach ($files as $js) {
      // todo: use NLS properly
      foreach ($packages as $n) {
        if (preg_match('/'.$n.'_.*\.js/', $js)) {
          /* $suffix = str_replace($n, '', $js); */
          /* $output->write(', <comment>'.$suffix.'</comment>'); */
          /* copy(FileSystem::makePath($nlsPath, $js), */
          /*      FileSystem::makePath($release_dir, $release_name, 'dojo', 'nls', $suffix)); */
          $output->write(', <comment>'.$js.'</comment>');
          $bundle = FileSystem::makePath($release_dir, $release_name, 'nls', $js);
          copy(FileSystem::makePath($nlsPath, $js), $bundle);
          $str = file_get_contents($bundle);
          $str = str_replace('dojo.provide("dojo.nls.', 'dojo.provide("nls.'.$n, $str);
          file_put_contents($bundle, $str);
        }
      }
    }
    $output->writeln('');
  }

  protected function buildProfile($data)
  {
    foreach ($data['prefixes'] as $p => &$item) {
      $item = array($item['ns'], $this->absPath($item['path']));
    }
    foreach ($data['layers'] as &$layer) {
      if (isset($layer['resourceName'])) {
        $layer['resourceName'] = $layer['resourceName'];
      }
      if (isset($layer['copyrightFile'])) {
        $layer['copyrightFile'] = $this->absPath($layer['copyrightFile']);
      }
      foreach ($layer['dependencies'] as &$dep) {
        $dep = $dep['module'];
      }
    }
    $file = tempnam(sys_get_temp_dir(), 'profile_');
    // why do we need str_replace? json_encode() puts backslashes everywherer..
    file_put_contents($file, 'dependencies='.str_replace('\/', '/', json_encode($data)).';');
    return $file;
  }

  protected function absPath($path)
  {
    $root_dir = $this->getContainer()->getParameter('kernel.root_dir');
    return FileSystem::getAbsolutePath($path, $root_dir);
  }

}
