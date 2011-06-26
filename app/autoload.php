<?php

$__lib_dir = __DIR__.'/../vendor';
require_once $__lib_dir.'/symfony/src/Symfony/Component/ClassLoader/UniversalClassLoader.php';

use Symfony\Component\ClassLoader\UniversalClassLoader;

$loader = new UniversalClassLoader();
$loader->registerNamespaces(array(
  'Symfony'     => $__lib_dir.'/symfony/src',
  'Symfony\\Bundle\\DoctrineMongoDBBundle' => $__lib_dir.'/bundles',
  'Sensio'    => $__lib_dir.'/bundles',
  'Funkiton' => $__lib_dir.'/bundles',
  'Doctrine\\Common'    => $__lib_dir.'/doctrine-common/lib',
  'Doctrine\\DBAL'    => $__lib_dir.'/doctrine-dbal/lib',
  'Doctrine\\ORM'    => $__lib_dir.'/doctrine-orm/lib',
  'Doctrine\\ODM'    => $__lib_dir.'/doctrine-mongodb-odm/lib',
  'Doctrine\\MongoDB' => $__lib_dir.'/doctrine-mongodb/lib',
  'Monolog'           => $__lib_dir.'/monolog/src',
  'Geonef\\Zig'         => $__lib_dir.'/zig/src',
  'Geonef\\ZigBundle'     => $__lib_dir.'/zig/src',
  'Geonef\\PgLinkBundle'     => $__lib_dir.'/zig/src',
  'Geonef\\Ploomap'     => $__lib_dir.'/ploomap-server/src',
  'Geonef\\PloomapBundle' => $__lib_dir.'/ploomap-server/src',
  'Geonef\\AireBundle' => $__lib_dir.'/../src',
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
