<?php

//require_once __DIR__.'/../../app/bootstrap.php.cache';
require_once __DIR__.'/../../../../../app/AppKernel.php';

use Symfony\Component\HttpFoundation\Request;

$env = $_SERVER['HTTP_FRAMEWORK_ENV'];
$kernel = new AppKernel($env, true || $env == 'dev');
//$kernel->loadClassCache();
$kernel->handle(Request::createFromGlobals())->send();


/* use Symfony\Component\HttpFoundation\Request; */
/* use Symfony\Components\HttpKernel\Exception\NotFoundHttpException; */

/* //require_once __DIR__.'/../../../../app/bootstrap.php.cache'; */
/* require_once __DIR__.'/../../app/AppKernel.php'; */

/* $env = $_SERVER['HTTP_FRAMEWORK_ENV']; */
/* $kernel = new AppKernel($env, $env == 'dev'); */
/* try { */
/*   $kernel->handle(Request::createFromGlobals())->send(); */
/* } */
/* catch (NotFoundHttpException $e) { */
/*   header('HTTP/1.0 404 Not Found'); */
/*   throw $e; */
/* } */
