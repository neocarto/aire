<?php

use Symfony\Components\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpFoundation\Request;

require_once __DIR__.'/../../../../../app/AppKernel.php';

$env = $_SERVER['HTTP_FRAMEWORK_ENV'];
$kernel = new AppKernel($env, $env == 'dev');
try {
  $kernel->handle(new Request)->send();
}
catch (NotFoundHttpException $e) {
  header('HTTP/1.0 404 Not Found');
  throw $e;
}
