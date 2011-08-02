<?php

//////////////////////////////////////////////////////////////////////
// INIT

use Symfony\Component\ClassLoader\UniversalClassLoader;
use Doctrine\Common\Annotations\AnnotationRegistry;

$__lib_dir = __DIR__.'/../vendor';
$__swift_dir = '/usr/share/php';
require_once $__lib_dir.'/symfony/src/Symfony/Component/ClassLoader/UniversalClassLoader.php';

$loader = new UniversalClassLoader();



//////////////////////////////////////////////////////////////////////
// NAMESPACES & PREFIXES

$loader->registerNamespaces(array(
  'Symfony'     => $__lib_dir.'/symfony/src',
  'Symfony\\Bundle\\DoctrineMongoDBBundle' => $__lib_dir.'/bundles',
  'Sensio'    => $__lib_dir.'/bundles',
  'Funkiton' => $__lib_dir.'/bundles',
  'Stof'  => $__lib_dir.'/bundles',
  'JMS'  => $__lib_dir.'/bundles',
  'FOS'  => $__lib_dir.'/bundles',
  'Gedmo' => $__lib_dir.'/gedmo-doctrine-extensions/lib',
  'Doctrine\\Common'    => $__lib_dir.'/doctrine-common/lib',
  'Doctrine\\DBAL'    => $__lib_dir.'/doctrine-dbal/lib',
  'Doctrine\\ORM'    => $__lib_dir.'/doctrine-orm/lib',
  'Doctrine\\ODM'    => $__lib_dir.'/doctrine-mongodb-odm/lib',
  'Doctrine\\MongoDB' => $__lib_dir.'/doctrine-mongodb/lib',
  'Monolog'           => $__lib_dir.'/monolog/src',
  'Metadata'          => $__lib_dir.'/metadata/src',
  'Geonef\\Zig'         => $__lib_dir.'/zig/src',
  'Geonef\\ZigBundle'     => $__lib_dir.'/zig/src',
  'Geonef\\PgLinkBundle'     => $__lib_dir.'/zig/src',
  'Geonef\\Ploomap'     => $__lib_dir.'/ploomap-server/src',
  'Geonef\\PloomapBundle' => $__lib_dir.'/ploomap-server/src',
  'Riate\\AireBundle' => $__lib_dir.'/../src',
  //'Zend' => '/usr/src/zf2/library',
));
$loader->registerPrefixes(array(
       'Twig_' => $__lib_dir.'/twig/lib',
       'Swift_' => $__swift_dir,
       //'Zend_'  => $__lib_dir.'/cartapatate/zend/library',
       ));
// intl
if (!function_exists('intl_get_error_code')) {
    require_once __DIR__.'/../vendor/symfony/src/Symfony/Component/Locale/Resources/stubs/functions.php';

    $loader->registerPrefixFallbacks(array(__DIR__.'/../vendor/symfony/src/Symfony/Component/Locale/Resources/stubs'));
}
$loader->registerNamespaceFallbacks(array(
    __DIR__.'/../src',
));
$loader->register();

//////////////////////////////////////////////////////////////////////
// DOCTRINE ANNOTATIONS READER

AnnotationRegistry::registerLoader(function($class) use ($loader) {
    $loader->loadClass($class);
    return class_exists($class, false);
});
AnnotationRegistry::registerFile(__DIR__.'/../vendor/doctrine-mongodb-odm/lib/Doctrine/ODM/MongoDB/Mapping/Annotations/DoctrineAnnotations.php');
//AnnotationRegistry::registerFile(__DIR__.'/../vendor/doctrine-orm/lib/Doctrine/ORM/Mapping/Driver/DoctrineAnnotations.php');

// Doctrine annotation reader (old  way, duplicate loaded)
//\Doctrine\Common\Annotations\AnnotationRegistry::registerAutoloadNamespaces($loader->getNamespaces());


//////////////////////////////////////////////////////////////////////
// OTHER

// Swiftmailer needs a special autoloader to allow
// the lazy loading of the init file (which is expensive)
require_once $__swift_dir.'/Swift.php';
Swift::registerAutoload($__swift_dir.'/swift_init.php');

// for Zend Framework & SwiftMailer
/* set_include_path($__lib_dir.'/zend/library'.PATH_SEPARATOR/\*.$__lib_dir.'/vendor/swiftmailer/lib'.PATH_SEPARATOR*\/.get_include_path()); */

