<?php

namespace Geonef\Ploomap\View\SvgMapLegend;

use Geonef\Zig\Registry\Mapper;

/**
 * Legend for intervals + discontinuities (RatioDisc)
 *
 */
class RatioDisc extends AbstractLegend
{
  const NS = 'http://www.w3.org/2000/svg';
  const WRAP_LENGTH = 25;
  const MARGIN = 20;

  /**
   * @RegistryMapValue
   */
  public $minWidth;

    /**
   * @RegistryMapValue
   */
  public $maxWidth;

    /**
   * @RegistryMapValue
   */
  public $nullWidth;

    /**
   * @RegistryMapValue
   */
  public $color;

  /**
   * @RegistryMapValue
   */
  public $nullColor;

  /**
   * @var array
   * @RegistryMapValue
   */
  public $classes;

  /**
   * Helper: XmlTag
   *
   * @var Object
   * @RegistryMapInstanciate(
   *    class = "Geonef\Zig\View\Helper\XmlTag",
   *    passThis = true
   *  )
   */
  public $tag;


  /**
   * Set disc properties
   *
   * @RegistryMapSetter(key="disc")
   */
  public function setDisc(array $disc)
  {
    Mapper::mapObject($disc, $this);
  }

  public function build()
  {
    $classesLegend = new Intervals();
    $classesLegend->setTranslator($this->translator);
    Mapper::mapObject(array_merge(array('sizeFactor' => $this->sizeFactor),
                                  $this->classes), $classesLegend);
    $classesSvg = $classesLegend->build();
    $this->yOffset += $classesLegend->getYOffset() + static::MARGIN;

    return $this->tag('g', array('xmlns' => self::NS, 'class' => 'legend'),
                      $classesSvg . $this->buildDiscontinuities());
  }

  protected function buildDiscontinuities()
  {
    $epFact = 1;
    $width = 50 * $this->sizeFactor;//8 // longueur des traits
    $space = 3 * $this->sizeFactor; // marge horizontale entre les traits
    $bottomMargin = 40 * $this->sizeFactor;
    $xOffset = 0 * $this->sizeFactor;
    $labelOffset = 30 * $this->sizeFactor;

    $min = $this->minWidth;
    $max = $this->maxWidth;
    $et = intval(round($max - $min));
    $list = array($min, intval(round($min + $et / 4)),
		   intval(round($min + $et / 2)), $max);
    $els = array();
    $els[] = $this->wrapText($this->translator->trans('geonef.ploomap.legend.disc.title'),
                             array('class' => 'title'));
    for ($i = 0, $count = count($list); $i < $count; $i++) {
      if ($i == 0)
	$txt = $this->translator->trans('geonef.ploomap.legend.disc.weak');
      elseif ($i == $count - 1)
	$txt = $this->translator->trans('geonef.ploomap.legend.disc.strong');
      else
	unset($txt);
      $epaisseur = floatval($list[$i]) * $epFact;
      $y = $this->yOffset + 0;
      $x = $xOffset + ($width + $space) * $i;
      $els[] = $this->tag('line',
                          array('x1' => $x, 'y1' => $y,
                                'x2' => $x + $width, 'y2' => $y,
                                'style' => 'stroke:'.$this->color
                                .';stroke-width:'.$epaisseur));
      if (isset($txt)) {
        $els[] = $this->tag('text',
                            array('x' => $x + $width / 2,
                                  'y' => $this->yOffset + $labelOffset,
                                  'text-anchor' => 'middle',
                                  'class' => 'width'),
                            $txt);
      }
      /* echo '<line x1="'.$x.'" y1="'.$y.'" x2="'.($x+$width).'" y2="'.$y */
      /*   .'" style="stroke:'.$couleur.';stroke-width:'.$epaisseur.'"/>'; */
      /* echo '<text x="'.($x + $width / 2).'" y="'.(self::$yOffset + 1) */
      /*   .'" class="epaisseur">'.$txt.'</text>'; */
    }
    $this->yOffset += $epaisseur + $bottomMargin;

    return implode($els);
  }

  /**
   * Forward call to member objects (helper handling)
   *
   * @return mixed
   */
  public function __call($name, $args)
  {
    if (isset($this->$name)) {
      return call_user_func_array(array($this->$name, '__invoke'), $args);
    }
    throw new \Exception('Call to undefined method: ' . $name);
  }

}
