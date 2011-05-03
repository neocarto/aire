<?php

$__lib_dir = __DIR__.'/../lib';
require_once $__lib_dir.'/symfony/src/Symfony/Component/ClassLoader/UniversalClassLoader.php';

use Symfony\Component\ClassLoader\UniversalClassLoader;

$loader = new UniversalClassLoader();
$loader->registerNamespaces(array(
  'Symfony'     => $__lib_dir.'/symfony/src',
  'Symfony\\Bundle\\DoctrineMongoDBBundle' => $__lib_dir.'/doctrine-mongodb-bundle/lib',
  'Doctrine\\Common'    => $__lib_dir.'/doctrine2-common/lib',
  'Doctrine\\DBAL'    => $__lib_dir.'/doctrine2-dbal/lib',
  'Doctrine\\ORM'    => $__lib_dir.'/doctrine2-orm/lib',
  'Doctrine\\ODM'    => $__lib_dir.'/doctrine-mongodb-odm/lib',
  'Doctrine\\MongoDB'           => $__lib_dir.'/doctrine-mongodb/lib',
  'Zig'         => $__lib_dir.'/zig/server',
  'Ploomap'     => $__lib_dir.'/ploomap/server',
  'CarnetsBundle' => $__lib_dir.'/carnets/server',
  //'Zend' => '/usr/src/zf2/library',
));
$loader->registerPrefixes
(array(
       'Twig_' => $__lib_dir.'/twig/lib',
       'Swift_' => '/usr/share/php',
       //'Zend_'  => $__lib_dir.'/cartapatate/zend/library',
       ));
$loader->register();

// for Zend Framework & SwiftMailer
/* set_include_path($__lib_dir.'/zend/library'.PATH_SEPARATOR/\*.$__lib_dir.'/vendor/swiftmailer/lib'.PATH_SEPARATOR*\/.get_include_path()); */
