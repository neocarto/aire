
dojo.provide('geonef.ploomap.legend.Intervals');

// parents
dojo.require('geonef.ploomap.legend.Abstract');

dojo.declare('geonef.ploomap.legend.Intervals', geonef.ploomap.legend.Abstract,
{
  // summary:
  //   Build a list of intervals
  //

  postMixInProperties: function() {
    this.inherited(arguments);
    this.manageValueKeys.push('classes', 'intervals', 'maximum');
  },

  buildRendering: function() {
    this.inherited(arguments);
    this.buildIntervals();
  },

  buildIntervals: function() {
    this.intervalsNode = dojo.create('div', { 'class': 'intervals' },
                                     this.containerNode);
    this.maximumNode = dojo.create('div',
      { 'class': 'maximum' }, this.intervalsNode);
  },

  _setClassesAttr: function(classes) {
    this.classes = classes;
    this.attr('value', classes);
  },

  _setIntervalsAttr: function(intervals) {
    this.intervals = intervals;
    while (this.maximumNode.previousSibling) {
      this.intervalsNode.removeChild(this.maximumNode.previousSibling);
    }
    var dc = dojo.create;
    var borderStyle = '';// 'border-color: '+this.classes.polygonOutlineColor+';';
    intervals.forEach(
      function(_class, key) {
        var div = dc('div', { 'class': 'class' },
                     this.maximumNode, 'before');
        var s1 = dc('span',
          { 'class': 'rect' + (key ? '' : ' first'),
            style: 'background: '+_class.color+';'+borderStyle,
            innerHTML: '&nbsp;' }, div);
        if (_class.minimum !== null) {
          var s2 = dc('span',
            { 'class': 'number',
              innerHTML: ''+this.formatNumber(_class.minimum) }, div);
        }
      }, this);
  },

  _setMaximumAttr: function(maximum) {
    while (this.maximumNode.firstChild) {
      this.maximumNode.removeChild(this.maximumNode.firstChild);
    }
    if (maximum !== null) {
      dojo.create('span',
        { innerHTML: ''+this.formatNumber(maximum) }, this.maximumNode);
    }
  },

  getFeatureInfoHtml: function(feature) {
    var text = this.inherited(arguments) || "";
    var value = feature.attributes.ratio || feature.attributes.value_0;
    if (value) {
      text += this.formatNumber(value)+
        " "+this.unit+"<br/>";
    }
    return text;
  }

});
