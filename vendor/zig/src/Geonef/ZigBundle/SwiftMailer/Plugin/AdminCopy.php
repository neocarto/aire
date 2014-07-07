<?php

namespace Geonef\ZigBundle\SwiftMailer\Plugin;

use Swift_Events_SendListener as SendListener;
use Swift_Events_SendEvent as SendEvent;


class AdminCopy implements SendListener
{
  protected $email;

  public function __construct($email)
  {
    $this->email = $email;
  }

  /**
   * Invoked immediately before the Message is sent.
   * @param Swift_Events_SendEvent $evt
   */
  public function beforeSendPerformed(SendEvent $evt)
  {
    $message = $evt->getMessage();
    $message->addBcc($this->email);
  }

  /**
   * Invoked immediately after the Message is sent.
   *
   * @param Swift_Events_SendEvent $evt
   */
  public function sendPerformed(SendEvent $evt)
  {
    /* $message = $evt->getMessage(); */
    /* $bcc = $message->getBcc(); */
    /* $message->setBcc($bcc); */
  }

}
