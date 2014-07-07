<?php

namespace Geonef\Zig\View;

interface ViewInterface
{
  /**
   * Build the view
   *
   * Return values can be, for example:
   * 		- XML/XHTML/HTML document as string
   * 		- XML/XHTML/HTML as DomDocument
   * 		- Media object of binary file
   *
   * @return mixed
   */
  public function build();
}
