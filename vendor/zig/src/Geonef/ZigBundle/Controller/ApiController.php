<?php

namespace Geonef\ZigBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Geonef\Zig\Api\Request;
use \Exception;

/**
 * Entry point for API requests (JSON)
 *
 * The request is submitted through POST, as a JSON string.
 * The key 'module' will be use to make the class name responsible
 * for processing the request.
 *
 * The response is encoded in JSON and printed as the HTTP response body.
 *
 * 2 possibilities for the structure of the request :
 *     Multiplexing of different requests:
 *       array('req1' => array('module' => 'test', 'action' => 'test')
 *             'req2' => array('module' => 'test', 'action' => 'test'))
 *
 * or Simple case:
 *       array('module' => 'test', 'action' => 'test')
 *
 * The controller will respond in the same way (one unique structure for one
 * unique request structure, or a parent structure containing one structure
 * for each request). In other words, if the request is multiplexed,
 * the response is multiplexed as well.
 */
class ApiController extends Controller
{

  public function dispatchAction()
  {
    $apiManager = $this->container->get('zig.api.manager');
    $requestData = $this->getRequestStruct();
    $request = $apiManager->newRequest($requestData);
    $request->execute();
    return $this->serializeOutput($request, $requestData);
  }

  protected function getRequestStruct()
  {
    $method = $this->container->get('request')->getMethod();
    switch ($method) {
    case 'POST':
      $tab = explode(';', $_SERVER['CONTENT_TYPE']);
      $type = trim($tab[0]);
      return $type == 'multipart/form-data' ?
        $this->getStructFromMultiPart() : $this->getStructFromPostBody();
    default:
      throw new Exception('invalid HTTP method for API: '.$method);
    }
  }

  /**
   * Get structure from HTTP body, serialized as JSON
   */
  protected function getStructFromPostBody()
  {
    $data = '';
    $body = fopen('php://input', 'r');
    if (!$body) {
      throw new Exception('No POST data');
    }
    while (!feof($body)) {
      $data .= fread($body, 2048);
    }
    fclose($body);
    $struct = json_decode($data, true);
    if (!$struct) {
      throw new Exception('Invalid JSON string');
    }
    return $struct;
  }

  /**
   * Get structure from different multipart/form-data parameters
   *
   * This is used especially for file uploads.
   * In those situations, client code used a hidden iframe io. If so,
   * be sure to pass the parameter outputMethod="textarea".
   *
   * Multiple parameters can also be given through a JSON serialization
   * contained in a parameter named "json".
   */
  protected function getStructFromMultiPart()
  {
    $params = $_POST;
    if (!count($params)) {
      return array('outputMethod' => 'textarea');
    }
    if (isset($params['json'])) {
      $data = json_decode($params['json'], true);
      unset($params['json']);
      if (is_array($data)) {
        $params = array_merge($params, $data);
      }
    }
    return $params;
  }

  /**
   * Make output available to client according to configured method.
   *
   * @return Response
   */
  protected function serializeOutput(Request $request, array $requestData)
  {
    $response = new Response();
    $method = isset($requestData['outputMethod']) ?
      $requestData['outputMethod'] : 'json';
    switch ($method) {
    case 'json':
      $response->headers->set('Content-Type', 'application/json');
      $response->setContent($request->getResponseAsJson());
      break;
    case 'textarea':
      $response->headers->set('Content-Type', 'text/html');
      $response->setContent('<textarea>'.$request->getResponseAsJson()
                            .'</textarea>');
      break;
    case 'raw':
      // Do nothing. Action was responsible for that.
      break;
    default:
      throw new \Exception('invalid API ouput method: '.$method);
    }
    return $response;
  }
}
