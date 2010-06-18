<?php

require_once __DIR__.'/cartapatate/symfony/src/Symfony/Foundation/UniversalClassLoader.php';

use Symfony\Foundation\UniversalClassLoader;

$loader = new UniversalClassLoader();
$loader->registerNamespaces(array(
  'Symfony'     => __DIR__.'/cartapatate/symfony/src',
  //'Application' => __DIR__,
  //'Bundle'      => __DIR__,
  'Doctrine'    => __DIR__.'/cartapatate/doctrine/lib',
  //'DoctrineExtensions' => __DIR__,
  'Zig'         => __DIR__.'/cartapatate/zig/lib',
  'Ploomap'     => __DIR__.'/cartapatate/ploomap/lib',
  'HurepoixBundle' => __DIR__.'/hurepoix',
  //'Zend' => __DIR__.'/cartapatate/compat/lib',
  'Zend' => '/usr/src/zf2/library',
));
$loader->registerPrefixes(array(
                                //'Swift_' => __DIR__.'/vendor/swiftmailer/lib/classes',
                                //'Zend_'  => __DIR__.'/cartapatate/zend/library',
));
$loader->register();

// for Zend Framework & SwiftMailer
set_include_path(__DIR__.'/cartapatate/zend/library'.PATH_SEPARATOR/*.__DIR__.'/vendor/swiftmailer/lib'.PATH_SEPARATOR*/.get_include_path());
