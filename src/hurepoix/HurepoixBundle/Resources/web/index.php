<?php

require_once __DIR__.'/../../../../../site/HurepoixKernel.php';

$env = $_SERVER['HTTP_FRAMEWORK_ENV'];
$kernel = new HurepoixKernel($env, $env == 'dev');
$kernel->handle()->send();
