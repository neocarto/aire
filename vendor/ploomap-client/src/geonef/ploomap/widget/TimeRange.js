
dojo.provide('geonef.ploomap.widget.TimeRange');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('geonef.ploomap.widget.TimeRange', [dijit._Widget, dijit._Templated],
{
  /**
   * Minimum date
   */
  min: new Date(),

  /**
   * Minimum date
   */
  max: new Date(),

  /**
   * Number of dates shown
   *
   * @type {number}
   */
  itemCount: 5,

  dateOpts: { selector: 'date', formatLength: 'medium' },

  /**
   * Gradient (HSL colorspace)
   *
   * @type {geonef.jig.util.color.Gradient}
   */
  gradient: null,

  templateString: dojo.cache('geonef.ploomap.widget', 'templates/TimeRange.html'),
  widgetsInTemplate: true,

  postMixInProperties: function() {
    this.inherited(arguments);
    if (this.itemCount < 2) {
      this.itemCount = 2;
    }
  },

  buildRendering: function() {
    this.inherited(arguments);
    this.setupRange();
  },

  setupRange: function() {
    this.setupGradient();
    this.createItems();
  },

  setupGradient: function() {
    var style;
    if (dojo.isWebKit && dojo.isWebKit < 534.16) {
      style = 'background: -webkit-gradient('
              + 'linear, left top, left bottom, '
              + 'from(' + this.gradient.getColorCssHsl(0) + '),'
              + 'to(' + this.gradient.getColorCssHsl(1) + '));';
    } else {
      var p = 'linear-gradient';
      if (dojo.isOpera) { p = '-o-linear-gradient'; }
      else if (dojo.isMoz) { p = '-moz-linear-gradient'; }
      else if (dojo.isWebKit) { p = '-webkit-linear-gradient'; }
      style = 'background-image: ' + p + '(top, ' +
        this.gradient.getColorCssHsl(0) + ', ' +
        this.gradient.getColorCssHsl(1) + ');';
    }
    // console.log('style', this, style, p);
    this.gradientNode.setAttribute('style', style);
  },

  createItems: function() {
    if (!this.max || !this.min) { return; }
    var size = this.max.getTime() - this.min.getTime();
    for (var i = 0; i < this.itemCount; ++i) {
      var prop = i / (this.itemCount - 1);
      var date = new Date(this.min.getTime() + size * prop);
      var label = dojo.date.locale.format(date, this.dateOpts)+'&nbsp;&mdash;';
      dojo.create('li', { innerHTML:label,
                          style: 'top:'+(prop*100)+'%' }, this.listNode);
    }
  }

});
