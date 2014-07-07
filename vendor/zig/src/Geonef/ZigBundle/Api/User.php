<?php

namespace Geonef\ZigBundle\Api;

use Geonef\Zig\Api\ActionDispatcher;
use FOS\UserBundle\Model\UserInterface;

/**
 * Various operations related to the user
 *
 * @package Zig
 * @subpackage Api
 * @author Okapi
 */
class User extends ActionDispatcher
{
  public function feedbackAction()
  {
    $user = $this->container->get('security.context')->getToken()->getUser();
    if ($user && $user instanceof UserInterface) {
      $userN = $user->getUsername().' <'.$user->getEmail().'>';
      $userS = $user->getUsername();
    } else {
      $userN = isset($this->request['user']) ? $this->request['user'] : '(not set)';
    }
    $body = sprintf("Host: %s\nVersion: %s\nUser: %s\n-----\n%s",
                    $this->request['host'],
                    $this->request['version'],
                    $userN,
                    $this->request['message']);
    $mailer = $this->container->get('mailer');
    //$cont = \Swift_DependencyContainer::getInstance()->listItems();
    $message = \Swift_Message::newInstance()
      ->setSubject('Cartapatate: feedback')
      ->setFrom('feedback@cartapatate.net', $userS)
      ->setTo('okapi@lapatate.org')
      ->setBody($body);

    $mailer->send($message);
    $this->response['sent'] = 'ok';
  }
}
