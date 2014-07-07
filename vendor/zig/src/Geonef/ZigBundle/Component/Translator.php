<?php

namespace Geonef\ZigBundle\Component;

//use Symfony\Component\Translation\Translator as SymfonyTranslator;
use Symfony\Bundle\FrameworkBundle\Translation\Translator as SymfonyTranslator;

class Translator extends SymfonyTranslator
{
  public function fetchMessages($keyPrefix = '', $domain = 'messages', $locale = null)
  {
    if (!isset($locale)) {
      $locale = $this->getLocale();
    }
    if (!isset($this->catalogues[$locale])) {
      $this->loadCatalogue($locale);
    }
    $all = $this->catalogues[$locale]->all($domain);
    if ($keyPrefix == '') {
      $messages = $all;
    } else {
      $messages = array();
      foreach ($all as $key => $msg) {
        if (strpos($key, $keyPrefix) === 0) {
          $messages[$key] = $msg;
        }
      }
    }

    return $messages;
  }

}
