<?php

namespace Geonef\ZigBundle\Service;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Session;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Routing\Route;
use Symfony\Component\Finder\Finder;
use Geonef\ZigBundle\Exception;
use Geonef\Zig\Util\FileSystem;
use Geonef\Zig\Util\Exec;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpKernel\Log\LoggerInterface;
use Geonef\ZigBundle\EventListener\DocumentEventArgs;


/**
 * Management of a static cache for controllers
 *
 * NOT dependant from Symfony (manipulated with dependency injection)
 *
 * Used by:
 *  - the document event listener, in order to remove out-of-date cache files
 *  - the kernel response event listener, to cache the response
 *  - the command to generate the rewrite rules
 *  - other various management commands
 *
 */
class StaticCacheManager
{
  /* /\** */
  /*  * @var RouterInterface */
  /*  *\/ */
  /* protected $router; */

  /**
   * @var string
   */
  protected $cacheDir;

  protected $isEnabled = true;

  /**
   * Cached routes, in the form of array($routeName => $cacheFilePattern)
   *
   * @var array
   */
  protected $routeCaches = array();

  /**
   * List of all dependencies
   *
   * @var array
   */
  protected $dependencies = array();

  /**
   * Clearing events, index by event name
   *
   * @var array
   */
  protected $clearingEvents = array();

  /**
   * @var DocumentManager
   */
  protected $dm;

  /**
   * @var Session
   */
  protected $session;

  /**
   * @var LoggerInterface
   */
  protected $logger;


  ////////////////////////////////////////////////////////////////////
  // Setup, getters, setters


  /**
   * Constructor
   *
   * @param string              $cacheDir
   * @param DocumentManager     $dm
   * @param Session             $session
   * @param LoggerInterface     $logger
   */
  public function __construct($cacheDir,
                              DocumentManager $dm, Session $session,
                              LoggerInterface $logger)
  {
    $this->cacheDir = $cacheDir;
    $this->dm = $dm;
    $this->session = $session;
    $this->logger = $logger;
  }

  /**
   * Set whether the static cache is enabled
   *
   * @param boolean $enabled
   */
  public function setEnabled($enabled)
  {
    $this->isEnabled = $enabled;
  }

  /**
   * Return whether the static cache is enabled
   *
   * @return boolean
   */
  public function isEnabled()
  {
    return $this->isEnabled;
  }

  /**
   * Make the given route cached
   *
   * @param string $routeName           name of route to cache the response of
   * @param string $cachePattern        pattern of cache file
   * @param array $dependencies         associated deps, forwarded to addDependency()
   */
  public function addRouteCache($routeName, $cachePattern,
                                $dependencies = array(), $clearingEvents = array())
  {
    $this->routeCaches[$routeName] = $cachePattern;
    foreach ($dependencies as $dep) {
      $this->addDependency($routeName, $dep['class'],
                           isset($dep['properties']) ? $dep['properties'] : null,
                           isset($dep['filter']) ? $dep['filter'] : null);
    }
    foreach ($clearingEvents as $dep) {
      $this->addClearingEvent($routeName, $dep['event'],
                              isset($dep['filter']) ? $dep['filter'] : null);
    }
  }

  /**
   * Add a dependency
   *
   * @param string $routeName           name of cached route to add a dependency on
   * @param string $documentClass       class of document
   * @param array  $properties          array of properties to depend on, or null for all
   * @param array  $filter              filter on properties, or null to depend on all documents
   */
  public function addDependency($routeName, $documentClass,
                                $properties = null, $filter = null)
  {
    $this->dependencies[] = array('route' => $routeName,
                                  'documentClass' => $documentClass,
                                  'properties' => $properties,
                                  'filter' => $filter);
  }

  /**
   * Register an event
   *
   * @param string $routeName           name of cached route to add a dependency on
   * @param string $documentClass       class of document
   * @param array  $properties          array of properties to depend on, or null for all
   * @param array  $filter              filter on properties, or null to depend on all documents
   */
  public function addClearingEvent($routeName, $event, $filter = null)
  {
    $this->clearingEvents[$event][] =
      array('route' => $routeName, 'filter' => $filter);
  }

  /**
   * Returns whether the static cache is enabled for the given route
   *
   * @return boolean
   */
  public function isRouteCached($routeName)
  {
    return isset($this->routeCaches[$routeName]);
  }

  /**
   * @return array
   */
  public function getAllRouteCaches()
  {
    return $this->routeCaches;
  }

  /**
   * @return array
   */
  public function getAllDependencies()
  {
    return $this->dependencies;
  }

  /**
   * Returns the parameter names for the static cache of given route
   *
   * @param string $routeName
   * @return array              indexed array of param names
   */
  public function getRouteCacheParams($routeName)
  {
    $this->ensureRouteCached($routeName);

    return $this->getPatternParams($this->routeCaches[$routeName]);
  }


  ////////////////////////////////////////////////////////////////////
  // Populating & using the cache


  /**
   * Cache the response
   *
   * @param string $routeName   name of related route
   * @param array  $parameters  associative array
   * @param string $content     content to cache
   */
  public function cacheResponse($routeName, $parameters, $content)
  {
    $path = $this->getCachePath($routeName, $parameters);
    FileSystem::ensureCreatable($path);
    $this->logger->info("caching ".strlen($content)
                        ." bytes into static file: ".$path);
    file_put_contents($path, $content);
  }

  /**
   * Get Apache rewrite conditon/rules blocs for all cached routes
   *
   * @return string
   */
  public function getAllApacheRewrite(RouterInterface $router)
  {
    $content = array();
    $routes = $router->getRouteCollection();
    foreach ($this->routeCaches as $name => $pattern) {
      $content[] = $this->getRouteApacheRewrite($name, $routes->get($name));
    }

    return implode("\n", $content);
  }

  /**
   * Get Apache rewrite conditon/rules blocs for the given cached route
   *
   * @param string $routeName
   * @return string
   */
  public function getRouteApacheRewrite($name, Route $route)
  {
    $this->ensureRouteCached($name);

    // compute file path replacement pattern
    $compiledRoute = $route->compile();
    $regex = preg_replace('/\?P<.+?>/', '',
                          substr(str_replace(array("\n", ' '), '',
                                             $compiledRoute->getRegex()), 1, -2));
    $pattern = $this->routeCaches[$name];
    $varOrder = array_flip($compiledRoute->getVariables());
    $params = $this->getPatternParams($pattern);
    $repl = array('{_route}' => $name);
    foreach ($params as $param) {
      if ($param != '_route') {
        if (!isset($varOrder[$param])) {
          throw new Exception("Parameter '$param' cannot be extracted "
                              ."from the URL (not in route pattern), route: ".$name);
        }
        $repl['{'.$param.'}'] = '%'.($varOrder[$param] + 1);
      }
    }
    $path = FileSystem::makePath($this->cacheDir, strtr($pattern, $repl));

    // make rule
    $rule = array("# Route '$name'");
    $rule[] = "RewriteCond %{REQUEST_URI} $regex";
    $rule[] = "RewriteCond $path -f";
    $rule[] = "RewriteRule .* $path [L]";
    //$rule[] = "RewriteRule .* {$options['script_name']} [QSA,L,$variables]";

    return implode("\n", $rule)."\n";
  }


  ////////////////////////////////////////////////////////////////////
  // Cache deps & clearing


  public function onDocumentDispatch(DocumentEventArgs $args)
  {
    $event = $args->getEventName();
    $doc = $args->getDocument();
    $meta = $this->dm->getClassMetadata(get_class($doc));
    $locale = $this->session->getLocale();

    if (substr($event, strrpos($event, '.') + 1) == 'onChange') {
      $deps = $this->getDependenciesOnDocument($doc, array_keys($args->getChangeSet()));
      foreach ($deps as $dep) {
        $params = $this->computeParams($dep, $doc, $meta, $locale);
        $this->cleanCache($dep['route'], $params);
      }
    }

    $clearings = $this->getClearingsForEvent($event);
    foreach ($clearings as $dep) {
      $params = $this->computeParams($dep, $doc, $meta, $locale);
      $this->cleanCache($dep['route'], $params);
    }
  }

  /**
   * Get dependences concerned with given document changes
   *
   * @param object $document
   * @param array  $changedProperties
   * @return array
   */
  public function getDependenciesOnDocument($document, $changedProperties)
  {
    $deps = array();
    foreach ($this->dependencies as $dep) {
      if ($document instanceof $dep['documentClass']) {
        if (!$dep['properties'] || // means "any property"
            count(array_intersect($changedProperties, $dep['properties'])) > 0) {
          $deps[] = $dep;
        }
      }
    }
    return $deps;
  }

  public function getClearingsForEvent($eventName)
  {
    return isset($this->clearingEvents[$eventName]) ?
      $this->clearingEvents[$eventName] : array();
  }

  /**
   * Clean cache files matching the given route and parameters
   *
   * Any parameter not defined in $parameters is considered as "any",
   * thus remove cache files for any possible value of these parameters
   * (eg. globbing)
   *
   * @param string $routeName
   * @param array $parameters
   */
  public function cleanCache($routeName, $parameters)
  {
    $this->ensureRouteCached($routeName);

    $paramNames = $this->getPatternParams($this->routeCaches[$routeName]);
    $params = array('_route' => $routeName);
    foreach ($paramNames as $param) {
      if ($param == '_route') {
        continue;
      }
      $params[$param] = isset($parameters[$param]) && $parameters[$param] ?
        $parameters[$param] : '*';
    }
    $path = $this->getCachePath($routeName, $params);
    $this->logger->info("cleaning glob: ".$path);
    Exec::create("rm ".$path)
      ->execute(array('output'=>'system', 'exceptionOnFailure'=>false,
                      'redirectStderr'=>false));
    /* $finder = Finder::create()->files()->name($path)->in($this->cacheDir); */
    /* foreach ($finder as $file) { */
    /*   $this->logger->debug('finder: '.gettype($file)); */
    /* } */
  }

  protected function computeParams($dep, $doc, $meta, $locale)
  {
    $params = array();
    if ($dep['filter'])  {
      foreach ($dep['filter'] as $prop => $param) {
        if ($prop == 'locale') {
          $params[$param] = $locale;
        } else {
          if ($meta->hasAssociation($prop)) {
            if ($meta->isSingleValuedReference($prop)) {
              if (!$doc->$prop) {
                continue;
              }
              $value = $doc->$prop->getId();
            } else {
              throw new Exception("invalid static cache filter field "
                                  ."'$prop' on document '".get_class($doc)."'");
            }
          } else {
            $value = $doc->$prop;
          }
          $params[$param] = $value;
        }
      }
    }
    return $params;
  }

  /**
   * Return absolute path of static cache
   *
   * @param string $routeName   name of related route
   * @param array  $parameters  associative array
   */
  protected function getCachePath($routeName, $parameters, $absolute = true)
  {
    $this->ensureRouteCached($routeName);
    $pattern = $this->routeCaches[$routeName];
    $paramNames = $this->getPatternParams($pattern);
    $repl = array();
    foreach ($paramNames as $param) {
      if (!isset($parameters[$param])) {
        throw new Exception("missing parameter '".$param."' for cached route: ".$routeName);
      }
      $repl['{'.$param.'}'] = $parameters[$param];
    }
    $path = strtr($pattern, $repl);

    return $absolute ? FileSystem::makePath($this->cacheDir, $path) : $path;
  }

  protected static function getPatternParams($pattern)
  {
    $params = array();
    preg_match_all('#\{([\w\d_]+)\}#', $pattern, $matches, PREG_PATTERN_ORDER);

    return $matches[1];
  }

  protected function ensureRouteCached($routeName)
  {
    if (!isset($this->routeCaches[$routeName])) {
      throw new Exception("no cache path configured for route: ".$routeName);
    }
  }

  public function getLogger()
  {
    return $this->logger;
  }

}
