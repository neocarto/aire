<?php

namespace Geonef\ZigBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

use Funkiton\InjectorBundle\Annotation\Inject;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * Translation-related utilities
 *
 * @Route("/translation")
 * @Inject("translator")
 */
class TranslationController extends Controller
{
  /**
   * @Route("/get", defaults={ "domain"="messages", "keyPrefix"="" })
   * @Route("/get/{_locale}", defaults={ "domain"="messages", "keyPrefix"="" })
   * @Route("/get/{_locale}/{domain}", defaults={ "keyPrefix"="" })
   * @Route("/get/{_locale}/{domain}/{keyPrefix}", defaults={ "keyPrefix"="" })
   */
  public function getAction($domain, $keyPrefix)
  {
    $messages = $this->translator->fetchMessages($keyPrefix, $domain);
    $content = '<table><tbody>';
    foreach ($messages as $key => $msg) {
      $content .= '<tr><td>'.$key.'</td><td>'.$msg.'</td></tr>'."\n";
    }
    $content .= '</tbody></table>';
    return new Response($content);
  }

  public function redirectLocaleAction($targetRoute)
  {
    $params = $this->getRequest()->attributes->all();
    unset($params['_route']);
    unset($params['_controller']);
    unset($params['targetRoute']);
    $params['_locale'] = $this->guessLocale();
    $url = $this->generateUrl($targetRoute, $params, true);
    return $this->redirect($url);
  }

  protected function guessLocale()
  {
    // French by default, for AIRE
    return 'fr';

    $locale = $this->get('session')->getLocale();
    if (!$locale) {
      $locale = $this->getRequest()->getPreferredLanguage();
    }
    if (!in_array($locale, array('fr', 'en'))) {
      $locale = 'en';
    }
    return $locale;
  }

}
