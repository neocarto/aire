<?php

use Symfony\Components\HttpKernel\Exception\NotFoundHttpException;

require_once __DIR__.'/../../../../../site/AppKernel.php';

$env = $_SERVER['HTTP_FRAMEWORK_ENV'];
$kernel = new AppKernel($env, $env == 'dev');
try {
  $kernel->handle()->send();
}
catch (NotFoundHttpException $e) {
  header('HTTP/1.0 404 Not Found');
  throw $e;
}
