<?php

require_once __DIR__.'/cartapatate/symfony/src/Symfony/Component/ClassLoader/UniversalClassLoader.php';

use Symfony\Component\ClassLoader\UniversalClassLoader;

$loader = new UniversalClassLoader();
$loader->registerNamespaces(array(
  'Symfony'     => __DIR__.'/cartapatate/symfony/src',
  'Doctrine\\Common'    => __DIR__.'/cartapatate/doctrine2-common/lib',
  'Doctrine\\DBAL'    => __DIR__.'/cartapatate/doctrine2-dbal/lib',
  'Doctrine\\ORM'    => __DIR__.'/cartapatate/doctrine2-orm/lib',
  'Doctrine\\ODM'    => __DIR__.'/cartapatate/doctrine-mongodb-odm/lib',
  'Doctrine\\MongoDB'           => __DIR__.'/cartapatate/doctrine-mongodb/lib',
  'Zig'         => __DIR__.'/cartapatate/zig/server',
  'Ploomap'     => __DIR__.'/cartapatate/ploomap/server',
  'CatapatateBundle' => __DIR__.'/catapatate/server',
  'Zend' => '/usr/src/zf2/library',
));
$loader->registerPrefixes
(array(
       'Twig_' => __DIR__.'/cartapatate/twig/lib',
       'Swift_' => '/usr/share/php',
       //'Zend_'  => __DIR__.'/cartapatate/zend/library',
       ));
$loader->register();

// for Zend Framework & SwiftMailer
set_include_path(__DIR__.'/cartapatate/zend/library'.PATH_SEPARATOR/*.__DIR__.'/vendor/swiftmailer/lib'.PATH_SEPARATOR*/.get_include_path());
