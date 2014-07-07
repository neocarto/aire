<?php

namespace Geonef\ZigBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Translation\Translator;
use Geonef\Zig\Util\FileSystem;
use Geonef\Zig\Util\ArrayAssoc;

/**
 * Get translations from ZigBundle translation service & sync them to dojo nls files
 *
 * @author Okapi
 * @see http://docs.dojocampus.org/build/buildScript
 * @see http://docs.dojocampus.org/build/profiles
 */
class SyncTranslationsCommand extends ContainerAwareCommand
{
  /**
   * Configures the current command.
   */
  protected function configure()
  {
    parent::configure();
    $this
      ->setName('zig:app:sync-translations')
      ->setDescription('Sync translations to dojo NLS files')
      ->setHelp(<<<EOT
The <info>zig:app:sync-translations</info> needs the ZigBundle Translator
                service to be enabled as the "translator" service.

This command fetches all translation and merge those which are related
to the "zig.app.localizationModules" config list, physically to the
corresponding files.
EOT
                );
  }

  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $am = $this->getContainer()->get('zig.app.manager');
    $modules = $am->getLocalizationModules();
    foreach ($modules as $module) {
      $this->processModule($output, $module);
    }
  }

  protected function processModule(OutputInterface $output, $module)
  {
    $am = $this->getContainer()->get('zig.app.manager');
    $locales = $am->getSupportedLocales();
    $output->writeln('Processing module: <comment>'.$module
                     .'</comment> (<comment>'.count($locales)
                     .'</comment> locales)');
    foreach ($locales as $locale) {
      $this->processModuleLocale($output, $module, $locale);
    }
  }

  protected function processModuleLocale(OutputInterface $output, $module, $locale)
  {
    $prefix = $module.'.';
    $translator = $this->getContainer()->get('translator');
    $translations = $translator->fetchMessages($prefix, 'messages', $locale);
    $output->writeln('   <comment>'.$locale.'</comment>: got <comment>'
                     .count($translations).'</comment> translations');
    $trans = array();
    foreach ($translations as $k => $t) {
      $trans[substr($k, strlen($prefix))] = $t;
    }
    unset ($translations);
    ArrayAssoc::expandSubKeys($trans);
    //var_dump($trans);
    $am = $this->getContainer()->get('zig.app.manager');
    foreach ($trans as $domain => $messages) {
      if (!is_array($messages)) {
        $output->writeln('   Ignoring <comment>'.$prefix.$domain
                         .'</comment>: value is not an array: <comment>'
                         .$messages.'</comment>');
        continue;
      }
      $path = $am->getNlsPath($module, $locale, $domain);
      /* if (file_exists($path)) { */
      /*   $json = file_get_contents($path); */
      /*   $struct = json_decode($json, true); */
      /*   ArrayAssoc::replaceRecursive($struct, $trans); */
      /*   $json = json_encode($struct); */
      /*   file_put_contents($path, $json); */
      /* } */
      $json = json_encode($messages);
      FileSystem::ensureCreatable($path);
      file_put_contents($path, $json);
      $output->writeln('       Wrote file: <comment>'.$path.'</comment>');
    }
  }


}
