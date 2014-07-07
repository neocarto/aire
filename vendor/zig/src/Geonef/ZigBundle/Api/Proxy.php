<?php

namespace Geonef\ZigBundle\Api;

use Geonef\Zig\Api\ActionDispatcher;

/**
 * Proxy-related operations
 *
 * @package Zig
 * @subpackage Api
 * @author Okapi
 */
class Proxy extends ActionDispatcher
{
  public function requestAction()
  {
    $this->checkArguments(array('url'));
    // extends from http://www.abdulqabiz.com/files/proxy.php.txt
    $url = $this->request['url'];
    $session = curl_init();
    //curl_setopt ($session, CURLOPT_POST, true);
    //curl_setopt ($session, CURLOPT_POSTFIELDS, $postvars);
    curl_setopt_array($session, array(CURLOPT_URL => $url,
                                      CURLOPT_HEADER => false,
                                      CURLOPT_FOLLOWLOCATION => true,
                                      CURLOPT_MAXREDIRS => 10,
                                      //CURLOPT_TIMEOUT => 4,
                                      CURLOPT_RETURNTRANSFER => true,
                                      //CURLOPT_HTTPAUTH => CURLAUTH_BASIC,

                 ));
    // CURLOPT_UNRESTRICTED_AUTH CURLOPT_USERPWD "user:passwd"
    if (isset($this->request['auth'])) {

      $auth = $this->request['auth']['user'] .':'.
        $this->request['auth']['passwd'];
      curl_setopt_array($session, array(CURLOPT_UNRESTRICTED_AUTH => true,
                                        CURLOPT_USERPWD => $auth));
    }
    $body = curl_exec($session);
    $code = curl_getinfo($session, CURLINFO_HTTP_CODE);
    $this->response['code'] = $code;
    $this->response['info'] = curl_getinfo($session);
    if ($code == 200) {
      $this->response['content'] = $body;
    }
    curl_close($session);

  }
}
