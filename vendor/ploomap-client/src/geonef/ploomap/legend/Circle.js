
dojo.provide('geonef.ploomap.legend.Circle');

// parents
dojo.require('geonef.ploomap.legend.Abstract');

// used in code
//dojo  require('geonef.jig.vendor.raphael');
dojo.require('dojox.gfx');
dojo.require('dojox.gfx.shape');
dojo.require('dojox.gfx.path');

// GFX renderers
// todo: think, should we have browser-specific packages or all in one?
// The following 4 must be kept commented:
// they are exclusive of each-other (they declare their implementation of shape classes)
// dojo.require('dojox.gfx.svg');
// dojo.require('dojox.gfx.vml');
// dojo.require('dojox.gfx.silverlight');
// dojo.require('dojox.gfx.canvas');

dojo.declare('geonef.ploomap.legend.Circle',
             [geonef.ploomap.legend.Abstract/*, geonef.jig.widget._AsyncInit*/],
{
  // summary:
  //   Build proportional circles
  //

  /**
   * Factor to apply to the stock value to get the circle diameter in meter units
   */
  factor: 1, //2500,
  lineLength: 5,
  lineSpace: 3,

  /**
   * Maximum circle size, in pixels
   *
   * If above, the circle is replaced with a "sorry" notice.
   *
   * @type {number}
   */
  maxCircleSize: 110,

  postMixInProperties: function() {
    this.inherited(arguments);
    this.manageValueKeys.push('circle');
  },

  buildRendering: function() {
    this.inherited(arguments);
    this.circleNode = dojo.create('div', {}, this.containerNode);
  },

  destroy: function() {
    this.clearCircle();
    this.inherited(arguments);
  },

  _setResolutionAttr: function(resolution) {
    if (resolution === this.resolution) { return; }
    this.resolution = resolution;
    this.buildCircle();
  },

  _setCircleAttr: function(circle) {
    this.circle = circle;
    this.attr('value', circle);
    this.buildCircle();
  },

  buildCircle: function() {
    //console.log('buildCircle', this, arguments, this.circle, this.circleNode);
    this.clearCircle();
    if (!this.circle) { return; }
    var c = this.circle;
    var self = this;
    var getSize = function(val) {
                    return Math.sqrt(val * self.factor *
                        c.sizeMultiplier / Math.PI) / self.resolution;
                  };
    var maxV = c.thresholds[c.thresholds.length - 1];
    var max = getSize(maxV);
    if (max > this.maxCircleSize) {
      dojo.create('p',
        { innerHTML: this.trans('circle.overSize',
            { size: dojo.number.round(max, 0), maxSize: this.maxCircleSize }) },
        this.circleNode);
      return;
    }
    var ox = 1;
    var oy = 10;
    var lineStroke = { color: '#333', width: 0.5 };
    var lineLen = 5;	// Longueur de la ligne a droite du cercle
    var lineSpace = 3;	// Espace X entre la ligne et le nombre
    var width = ox + max + lineLen + lineSpace + 40;
    var height = oy + max + 10;
    var cs = dojo.getComputedStyle(this.domNode);
    var font = { family: cs.fontFamily, size: cs.fontSize };
    if (dojo.isIE) { // under IE, the SVG font would be too small
      font.size = "1em";
    }
    dojo.style(this.circleNode, { width: width+'px', height: height+'px'});
    this.surface = dojox.gfx.createSurface(this.circleNode, width, height);
    var circle = this.surface.createCircle(
      {cx: ox+max/2, cy: oy+max/2, r: max/2});
    circle.setStroke(c.symbolOutlineColor);
    circle.setFill(c.symbolFillColor);
    c.thresholds.slice(0).reverse().forEach(
        function(num) {
          var d = getSize(num);
          var circle = this.surface.createCircle(
            { cx: ox + max / 2, cy: oy + max/2 + (max - d) / 2, r: d/2});
          circle.setStroke(lineStroke/*{ color: c.symbolOutlineColor, width: 0.5 }*/);
          circle.setFill(c.symbolFillColor);
          // console.log('circle', { factor: self.factor, res: self.resolution,
          //                         num: num, d: d, cx: ox+max/2,
          //                         cy: oy+max/2 + (max - d) / 2, r: d/2}, circle, this);
          var x = ox + max + lineLen;
          var y = oy + max / 2 + (max - d) / 2 - d / 2;
          var line = this.surface.createLine(
            { x1: ox+max/2, y1: y, x2: x, y2: y });
          line.setStroke(lineStroke);
          var label = this.surface.createText(
            { x: x + lineSpace, y: y + 3, text: this.formatNumber(num) });
          label.setFont(font/*{family: 'arial', size: '8pt' }*/);
          label.setFill(lineStroke.color);
        }, this);
  },

  clearCircle: function() {
    if (this.surface) {
      this.surface.clear();
      this.surface.destroy();
      this.surface = null;
    }
    this.circleNode.innerHTML = '';
  },

  getFeatureInfoHtml: function(feature) {
    var text = this.inherited(arguments) || "";
    if (feature.attributes.stock) {
      text += //"Stock : "+
        this.formatNumber(feature.attributes.stock)+
        " "+this.unit+"<br/>";
    }
    return text;
  }

});
