<?php

require_once __DIR__.'/cartapatate/symfony/src/Symfony/Framework/UniversalClassLoader.php';

use Symfony\Framework\UniversalClassLoader;

$loader = new UniversalClassLoader();
$loader->registerNamespaces(array(
  'Symfony'     => __DIR__.'/cartapatate/symfony/src',
  'Doctrine\\Common'    => __DIR__.'/cartapatate/doctrine2-common/lib',
  'Doctrine\\DBAL'    => __DIR__.'/cartapatate/doctrine2-dbal/lib',
  'Doctrine\\ORM'    => __DIR__.'/cartapatate/doctrine2-orm/lib',
  'Doctrine\\ODM'    => __DIR__.'/cartapatate/doctrine-mongodb-odm/lib',
  //'Bundle\\DoctrineMongoDBBundle' => __DIR__.'/cartapatate/doctrine-mongodb-bundle',
  'Zig'         => __DIR__.'/cartapatate/zig/lib',
  'Ploomap'     => __DIR__.'/cartapatate/ploomap/lib',
  'CatapatateBundle' => __DIR__.'/catapatate',
  //'Zend' => __DIR__.'/cartapatate/compat/lib',
  'Zend' => '/usr/src/zf2/library',
));
$loader->registerPrefixes(array(
                                'Swift_' => '/usr/local/lib/php', //__DIR__.'/vendor/swiftmailer/lib/classes',
                                //'Zend_'  => __DIR__.'/cartapatate/zend/library',
));
$loader->register();

// for Zend Framework & SwiftMailer
set_include_path(__DIR__.'/cartapatate/zend/library'.PATH_SEPARATOR/*.__DIR__.'/vendor/swiftmailer/lib'.PATH_SEPARATOR*/.get_include_path());
