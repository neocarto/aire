<?php

namespace Geonef\Zig\Util;

use Geonef\Zig\Util\String;
use \Exception;

/**
 * File system utilities
 *
 * This class cannot be instanciated. It only provides static methods.
 * Some of these methods may be redundant with Symfony's. In these cases,
 * Symfony methods should be preferred.
 *
 * Warning: the methods are UNIX-compatible, but Windows is not garanteed.
 * ('/' vs. '\\')
 *
 * @author Okapi <okapi@lapatate.org>
 */
abstract class FileSystem
{
  /**
   * Make filesystem path
   *
   * This method takes as many arguments as needed, whether strings or
   * arrays, or a combination of the two.
   *
   * Example (on UNIX) :
   * 		makePath('home', 'okapi', 'test') => 'home/okapi/test'
   * 	 	makePath(array('home', 'okapi', 'test')) => 'home/okapi/test'
   *
   * The DIRECTORY_SEPARATOR constant is used to separate the components.
   *
   * @param array|string	$cpt		first directory components
   * @param array|string	$cpt,...	unlimited list of directory components
   * 									to contatenate to the path
   * @return string
   */
  public static function makePath($cpt)
  {
    $parts = array();
    $args = func_get_args();
    foreach ($args as $arg) {
      if (is_array($arg)) {
        $parts = array_merge($parts, $arg);
      } elseif (is_string($arg)) {
        $parts[] = $arg;
      }
    }
    return implode(DIRECTORY_SEPARATOR,
                   array_filter($parts, function($s) { return strlen($s) > 0; }));
  }

  /*public static function makePath($cpt)
  {
    $parts = array();
    $args = func_get_args();
    foreach ($args as $arg) {
      if (is_array($arg)) {
        $parts += $arg;
      } elseif (is_string($arg)) {
        $parts[] = $arg;
      }
    }
    $final = array();
    foreach ($parts as $p) {
      if (0 === strpos($p, '/')) {

      }
    }
    }*/

  /**
   * Clean ".." occurences of path, as shell's "cd" command does
   *
   * Example: "/a/b///c/../../x" -> "/a/x"
   *
   * @param string $path
   * @return string
   */
  public static function cleanPath($path)
  {
    $parts = strlen($path) && $path[0] == DIRECTORY_SEPARATOR ?
      array('') : array(); // to conserve first sep if present
    foreach (explode(DIRECTORY_SEPARATOR, $path) as $part) {
      if ($part == '..' && count($parts)) {
        array_pop($parts);
      } elseif (strlen($part)) {
        $parts[] = $part;
      }
    }
    return implode(DIRECTORY_SEPARATOR, $parts);
  }

  /**
   * Trim extension(s) from path
   *
   * @param string $path
   * @return string
   */
  public static function trimExtension($path)
  {
    $dir = dirname($path);
    $file = basename($path);
    $newFile = substr($file, 0, strcspn($file, '.'));
    $new = $dir == '.' ? $newFile : static::makePath($dir, $newFile);
    return $new;
  }

  /**
   * Create a temporary directory and returns its absolute path
   */
  public static function makeTempDir()
  {
    throw new Exception('unimplemented');
    //$siteTmp = Okapi_Site::getInstance()->site->getTmpDir();
    do {
      $id = uniqid();
      $path = static::makePath($siteTmp, $id);
      if (!file_exists($path)) {
        return $path;
      }
    } while (42);
  }

  public static function removeRecursive($path)
  {
    $cmd = sprintf('rm -rf %s', $path);
    system($cmd);
  }

  public static function move($orig, $dest)
  {
    rename($orig, $dest);
    /*$cmd = sprintf('mv %s %s', $orig, $dest);
     system($cmd);*/
  }

  /**
   * Recursiverly copy the directory content
   *
   * It ignores the files/dirs named $ignore.
   * Existing files are not overwritten.
   *
   * @param string $orig
   * @param string $dest
   * @param array  $ignore	list of file name which should be ignored
   * @param array  $ignoreRegexes		regexes of dirs to be ignored
   * 									(matched against full relative path)
   */
  public static function copyRecursive($orig, $dest, $ignore = array(),
                                       $onlyRegexes = null,
                                       $_basePath = '')
  {
    $dir = opendir($orig);
    while (($f = readdir($dir))) {
      if ($f === '.' || $f === '..') {
        continue;
      }
      $oPath = $orig . DIRECTORY_SEPARATOR . $f;
      $dPath = $dest . DIRECTORY_SEPARATOR . $f;
      //if ($onlyRegexes !== null)
      //printf("orig: %s\ndest: %s\n", $oPath, $dPath);
      $_newBasePath = $_basePath . $f . (is_dir($oPath) ? '/' : '');
      if (in_array($f, $ignore)) {
        //printf("ignoring %s (simple)\n", $_newBasePath);
        continue;
      }
      if (is_array($onlyRegexes)) {
        $_toCopy = false;
        foreach ($onlyRegexes as $regex) {
          //printf("checking regex %s on dir %s\n", $regex, $_newBasePath);
          if (ereg($regex, $_newBasePath)) {
            //printf("ok to copy %s (regex)\n", $_newBasePath);
            $_toCopy = true;
            break;
          }
        }
        if (!$_toCopy) {
          continue;
        }
      }
      if (is_link($oPath)) {
        if (!file_exists($dPath)) {
          symlink(readlink($oPath), $dPath);
        }
      } elseif (is_file($oPath)) {
        if (!file_exists($dPath)) {
          //static::log('copy ' . $oPath . ' to ' . $dPath);
          copy($oPath, $dPath);
        }
      } elseif (is_dir($oPath)) {
        if (!file_exists($dPath)) {
          //static::log('mkdir ' . $dPath);
          static::mkdir($dPath);
        } elseif (!is_dir($dPath)) {
          throw new Exception('destination path "' . $dPath . '" '
                              . 'is expected to be a directory, for copy from '
                              . $oPath);
        }
        static::copyRecursive($oPath, $dPath, $ignore, $onlyRegexes,
                            $_newBasePath);
      } else {
        throw new Exception('Orig path ' . $oPath . ' is not a '
                            . 'regular file nor a directory');
      }
    }
    closedir($dir);
  }

  /**
   * Recursiverly symlink the directory content
   *
   * It ignores the files/dirs named $ignore.
   * Existing files are not overwritten.
   *
   * @param string $orig
   * @param string $dest
   * @param array  $ignore	list of file name which should be ignored
   * @param array  $ignoreRegexes		regexes of dirs to be ignored
   * 									(matched against full relative path)
   */
  public static function symlinkRecursive($orig, $dest, $ignore = array(),
                                          $onlyRegexes = null,
                                          $_basePath = '')
  {
    $dir = opendir($orig);
    while (is_string($f = readdir($dir))) {
      if ($f === '.' || $f === '..') {
        continue;
      }
      $oPath = $orig . DIRECTORY_SEPARATOR . $f;
      $dPath = $dest . DIRECTORY_SEPARATOR . $f;
      //if ($onlyRegexes !== null)
      //printf("orig: %s\ndest: %s\n", $oPath, $dPath);
      $_newBasePath = $_basePath . $f . (is_dir($oPath) ? '/' : '');
      if (in_array($f, $ignore)) {
        //printf("ignoring %s (simple)\n", $_newBasePath);
        continue;
      }
      if (is_array($onlyRegexes)) {
        $_toCopy = false;
        foreach ($onlyRegexes as $regex) {
          //printf("checking regex %s on dir %s\n", $regex, $_newBasePath);
          if (ereg($regex, $_newBasePath)) {
            //printf("ok to copy %s (regex)\n", $_newBasePath);
            $_toCopy = true;
            break;
          }
        }
        if (!$_toCopy) {
          continue;
        }
      }
      if (is_file($oPath)) {
        if (!file_exists($dPath)) {
          //static::log('symlink ' . $oPath . ' to ' . $dPath);
          //symlink($oPath, $dPath); // normal (absolute) symlink
          static::symlinkRelative($oPath, $dPath); // relative symlink
        }
      } elseif (is_dir($oPath)) {
        if (!file_exists($dPath)) {
          //static::log('mkdir ' . $dPath);
          static::mkdir($dPath);
        } elseif (!is_dir($dPath)) {
          throw new Exception('destination path "' . $dPath . '" '
                              . 'is expected to be a directory, for copy from '
                              . $oPath);
        }
        static::symlinkRecursive($oPath, $dPath, $ignore, $onlyRegexes,
                               $_newBasePath);
      } else {
        throw new Exception('Orig path ' . $oPath . ' is not a '
                            . 'regular file nor a directory');
      }
    }
    closedir($dir);
  }

  /**
   * DEBUG - uses printf() to dump $str
   */
  public static function log($str)
  {
    printf("%s\n", $str);
  }

  /**
   * Find directory content recursively
   *
   * Returns an indexed array, each value being the path of the file,
   * relatively to $directory
   *
   * @param $directory string Path of directory to scan
   * @return array
   */
  public static function scandirRecursive($directory)
  {
    $list = scandir($directory);
    $ret = array();
    foreach ($list as $file) {
      if ($file == '.' || $file == '..') {
        continue;
      }
      $path = String::makePath($directory, $file);
      if (is_dir($path)) {
        $sublist = static::scandirRecursive($path);
        foreach ($sublist as $subfile) {
          $ret[] = String::makePath($file, $subfile);
        }
      } else {
        $ret[] = $file;
      }
    }
    return $ret;
  }

  /**
   * Read directory's content and return the last file from alphabtical order
   *
   * @param string $dir		directory to read
   * @param string $prefix	ignore files not beginning with this prefix
   */
  public static function selectLastFileFromSortedDir($dir, $prefix = '')
  {
    $list = scandir($dir, 1);
    while (count($list) && strpos($list[0], $prefix) !== 0) {
      array_shift($list);
    }
    return count($list) ? $list[0] : null;
  }

  /**
   * Same as PHP's link() function, but try to make it relative
   *
   * Example: calling symlink_relative('/a/b/c/d/e', '/a/b/x/y')
   * 		will create the symlink /a/b/c/d/e targetting '../../x/y'.
   *
   * @param string $target		target of symlink
   * @param string $link			name of symlink
   */
  public static function symlinkRelative($target, $link)
  {
    $newTarget = static::getRelativePath($target, $link);
    //printf("symlink(%s, %s)\n", $newTarget, $link);
    try {
      $name = symlink($newTarget, $link);
    }
    catch (\Exception $e) {
      throw new \Exception('exception dering symlin("'.$newTarget
                           .'", "'.$link.'"): '.$e->getMessage(),
                           $e->getCode(), $e);
    }
    return $name;
  }

  /**
   * Return absolute path of symlink target
   *
   * Symlinks are resolved recursively until a non-symlink file is found.
   *
   * @param string $path
   * @return string
   */
  public static function getAbsoluteTarget($path)
  {
    //_log('debug')->info('getAbsoluteTarget: '.$path);
    while (is_link($path)) {
      $base = dirname($path);
      $rel = readlink($path);
      $path = static::cleanPath(static::makePath($base, $rel));
      //_log('debug')->info(sprintf('path(%s, %s) = %s', $base, $rel, $path));
      //echo sprintf('path(%s, %s) = %s', $base, $rel, $path) . "\n";exit;
    }
    return $path;
  }

  /**
   * From given path, find equivalent path relatively to $refPath
   *
   * @param string $path			path to process
   * @param string $refPath		reference path
   */
  public static function getRelativePath($path, $refPath)
  {
    $c = String::commonPrefixLength($path, $refPath);
    $offset = substr_count(trim(substr($refPath, $c), '/'), '/');
    $relPath = str_repeat('../', $offset) . substr($path, $c);
    return $relPath;
  }

  /**
   * Make absolute path according to $path and reference path
   *
   * If $path starts with '/', it is considered to be absolute already.
   * Otherwise, the absolute path is composed by concatenating $path
   * and $refPath.
   *
   * @param $path    string     Path (relative or absolute)
   * @param $refPath string     Base path, in case $path is relative
   * @return string Absolute path (starts with '/').
   */
  public static function getAbsolutePath($path, $refPath)
  {
    return 0 === strpos($path, '/') ? $path
      : static::makePath($refPath, $path);
  }

  /**
   * Wrapper for legacy mkdir(), adding path in exceptions
   *
   * @param string $path        Path of directory to create
   */
  public static function mkdir($path)
  {
    try {
      mkdir($path);
    }
    catch (\Exception $e) {
      throw new \Exception("failed to create directory: ".$path, 0, $e);
    }
  }

  public static function ensureCreatable($path)
  {
    $p = explode('/', dirname($path));
    /* if ($p[0] == '') { */
    /*   array_shift($p); */
    /* } */
    $cp = '';
    foreach ($p as $n) {
      $cp = static::makePath($cp, $n);
      //echo "checking: ".$cp."(".$n.")\n";
      $dir = '/'.$cp;
      if (!is_dir($dir)) {
        static::mkdir($dir);
      }
    }
  }

}
