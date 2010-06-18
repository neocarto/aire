<?php

require_once __DIR__.'/../../../../../site/Kernel.php';

$env = $_SERVER['HTTP_FRAMEWORK_ENV'];
$kernel = new Kernel($env, $env == 'dev');
$kernel->handle()->send();
