
dojo.provide('geonef.ploomap.list.tool.map.DataView');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// in template
dojo.require('dijit.layout.TabContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.input.Group');
dojo.require('geonef.jig.input.Label');
dojo.require('dijit.form.NumberSpinner');
dojo.require('dijit.form.SimpleTextarea');

// used in code
dojo.require('geonef.jig.api');
dojo.require('dojox.charting.Chart2D');
dojo.require('dojox.charting.themes.PlotKit.purple');
dojo.require('dojox.charting.action2d.Tooltip');
dojo.require('dojox.charting.action2d.Highlight');
dojo.require('dojox.gfx.svg');
dojo.require('dojox.gfx.shape');
dojo.require('dojox.gfx.path');

/**
 * Map data preview with a few statistical values
 *
 * @class
 */
dojo.declare('geonef.ploomap.list.tool.map.DataView',
             [ dijit._Widget, dijit._Templated ],
{

  /**
   * @type {string}
   */
  uuid: '',

  chartWidth: 300,
  chartBarWidth: 3,

  /**
   * @inheritsDoc
   */
  templateString: dojo.cache('geonef.ploomap.list.tool.map',
                             'templates/DataView.html'),

  /**
   * @inheritsDoc
   */
  widgetsInTemplate: true,

  /**
   * Discretization methods - according to Nicolas Lambert's doc (2010-11-24)
   */
  discretMethods: {
    equalAmplitude: function(stats, k) {
      var a = (stats.maximum - stats.minimum) / k;
      var v = stats.minimum;
      var bounds = [];
      for (var i = 0; i < k - 1; ++i) {
        v += a;
        bounds.push(v);
      }
      return bounds;
    },
    quantile: function(stats, k) {
      var e = stats.count / k;
      var bounds = [];
      var idx = 0;
      for (var i = 0; i < k - 1; ++i) {
        idx += e;
        var iidx = parseInt(Math.round(idx));
        bounds.push(this.data.values[iidx]);
      }
      return bounds;
    },
    deviation: function(stats, k) {
      var et = stats.standardDeviation;
      var v = (k - 3) / -2;
      var bounds = [];
      for (var i = 0; i < k - 1; ++i) {
        v += 1;
        bounds.push(stats.average + v * et);
      }
      return bounds;
    },
    geometric: function(stats, k) {
      var r =  Math.pow(10, (Math.log(stats.maximum) / Math.log(10) -
                             Math.log(stats.minimum) / Math.log(10)) / k);
      var v = stats.minimum;
      var bounds = [];
      for (var i = 0; i < k - 1; ++i) {
        v *= r;
        bounds.push(v);
      }
      return bounds;
    },
    geometric2: function(stats, k) {
      var logs = this.data.values.map(
        function(v) { return Math.log(v) / Math.log(10); });
      var sumReduce = function(s, v) { return s + v; };
      var sum = logs.reduce(sumReduce);
      var ssum = logs.map(function(v) { return v * v; }).reduce(sumReduce);
      var stats2 = { average: sum / logs.length,
                     standardDeviation: Math.sqrt(ssum / logs.length -
                                                  Math.pow(sum / logs.length, 2)) };
      var bounds = this.discretMethods.deviation(stats2, k);
      bounds = bounds.map(function(log) { return Math.pow(10, log); });
      return bounds;
    }
  },


  ////////////////////////////////////////////////////////////////////
  // Methods

  postMixInProperties: function() {
    this.inherited(arguments);
    this.dataReady = new geonef.jig.Deferred();
    this.dataReady.deferCall(this,
      ['updateStats', 'updateDiscret', 'updateChart', 'updateValues']);
  },

  postCreate: function() {
    this.inherited(arguments);
    this.connect(this.tabContainer, 'onResize', 'onResize');
  },

  destroy: function() {
    this.clearChart();
    this.inherited(arguments);
  },

  onResize: function() {
    // hook
  },

  _setUuidAttr: function(uuid) {
    if (this.data && this.uuid === uuid) { return; }
    this.uuid = uuid;
    this.getData();
  },

  /**
   * Load data including the list of values & statistics
   */
  getData: function() {
    if (!this.uuid) {
      return;
    }
    dojo.addClass(this.domNode, 'loading');
    geonef.jig.api.request(
      {
        module: 'listQuery.map.statistics',
        action: 'getValues',
        uuid: this.uuid,
        callback: dojo.hitch(this, 'installData')
      }).setControl(this.statsPane.domNode);
  },

  /**
   * API request callback: install data and fire deferred "dataReady"
   */
  installData: function(data) {
    this.data = data;
    var stats = this.data.statistics;
    var count = this.data.values.length;
    var maxBarCount = Math.min(count,
      Math.floor(this.chartWidth / this.chartBarWidth));
    var minBarCount = Math.min(2, count);
    var minStepSize = (stats.maximum - stats.minimum) / maxBarCount;
    var maxStepSize = (stats.maximum - stats.minimum) / minBarCount;
    var step = this.stepSlider.attr('value');
    //console.log('data, step...', this, arguments, minStepSize, maxStepSize,
    //            minBarCount, maxBarCount, step);
    this.stepSlider.attr('minimum', minStepSize);
    this.stepSlider.attr('maximum', maxStepSize);
    this.stepSlider.attr('value', minStepSize);
    if (!this.dataReady.hasFired()) {
      this.dataReady.callback();
    }
    this.onDataChange();
  },

  onDataChange: function() {
    this.updateStats();
    this.updateDiscret();
    this.updateChart();
    this.updateValues();
  },

  /**
   * Update statistics [deferred]
   */
  updateStats: function() {
    this.statisticsGroup.attr('value', null);
    this.statisticsGroup.attr('value', this.data.statistics);
  },

  /**
   * Update auto-discretisation [deferred]
   */
  updateDiscret: function() {
    var classCount = this.classCountInput.attr('value');
    var comma = this.showCommasInput.attr('value') ? ',' : '';
    //console.log('updateDiscret', this, arguments, classCount);
    while (this.discretBody.firstChild) {
      this.discretBody.removeChild(this.discretBody.firstChild);
    }
    var stats = this.data.statistics;
    var dc = dojo.create;
    var tr = dc('tr', {}, this.discretBody);
    dc('td', { innerHTML: '&nbsp;' }, tr);
    dc('td', { innerHTML: 'min', style:'font-style:italic' }, tr);
    for (var i = 0; i < classCount - 1; ++i) {
      dc('td', { innerHTML: this.formatNum(i+1) }, tr);
    }
    dc('td', { innerHTML: 'max', style:'font-style:italic' }, tr);
    var even = true;
    geonef.jig.forEach(this.discretMethods,
        function(func, method) {
          even = !even;
          var bounds = func.call(this, stats, classCount);
          var tr = dc('tr', {'class':even?'even':'odd'}, this.discretBody);
          dc('td', { innerHTML: method }, tr);
          dc('td', { innerHTML: this.formatNum(stats.minimum)+comma,
                     style:'font-style:italic' }, tr);
          bounds.forEach(
              function(bound) {
                dc('td', { innerHTML: this.formatNum(bound)+comma }, tr);
              }, this);
          dc('td', { innerHTML: this.formatNum(stats.maximum),
                     style:'font-style:italic' }, tr);
        }, this);
    this.discretPane.resize();
    //this.tabContainer.resize();
  },

  /**
   * Update chart [deferred]
   */
  updateChart: function() {
    var step = this.stepSlider.attr('value');
    //console.log('updateChart', this, arguments, step);
    this.clearChart();
    //var width = 320; // pixels
    //var count = Math.min(20, this.data.values.length);
    var stats = this.data.statistics;
    var count = Math.ceil((stats.maximum - stats.minimum) / step);
    step = (stats.maximum - stats.minimum) / count;
    this.stepValueNode.innerHTML = geonef.jig.util.number.format(step, {digits:1});
    this.stepCountNode.innerHTML = count;
    //var step = (stats.maximum - stats.minimum) / count;
    var values = [];
    for (var i = 0; i < count; ++i) {
      values.push(0);
    }
    this.data.values.forEach(
        function(v) {
          var k = Math.floor((v - stats.minimum) / step);
          //console.log('value', v, 'key', (v - stats.minimum) / step, 'k', k);
          if (k < 0) { k = 0; }
          if (k >= count) { k = count - 1; }
          values[k]++;
        }, this);
    var serie = values.map(
      function(v, k) {
        var min = k * step + stats.minimum;
        return {
          x: min+step/2, //k,
          //z: k,
          y: v,
          tooltip:  geonef.jig.util.number.format(min, {digits:4})+
            '&ndash;'+geonef.jig.util.number.format(min+step, {digits:4})+
            ' : '+v+' valeurs'
        };
      });
    var labelFunc = function(k) {
      return geonef.jig.util.number.format(stats.minimum + k * step,
                                    {digits:2}); };
    var bg = dojo.getComputedStyle(this.chartNode).backgroundColor;
    var defaultAxisParams = {
      fontColor: '#000',
      stroke: { color: '#000', width: 1 },
      majorTick: { color: '#000', width: 1 },
      minorTicks: false, microTicks: false, minorLabels: false
      //majorLabels: true,
      //fixLower: "major",
      //vertical: true,
      //fixUpper: "major",
      //includeZero: true,
      //leftBottom: false,
    };
    //console.log('values', this, values, serie, step, stats);
    this.chart = new dojox.charting.Chart2D(this.chartNode, { fill: bg });
    this.chart.setTheme(dojox.charting.themes.PlotKit.purple);
    this.chart.theme.plotarea.fill = null;
    this.chart.addAxis('y', dojo.mixin({ vertical:  true }, defaultAxisParams));
    this.chart.addAxis('x', dojo.mixin({
                         //min: stats.minimum, max: stats.maximum,
                         min: 0, max: serie.length,
                         includeZero: false,
                         labelFunc: labelFunc,
                       }, defaultAxisParams));
    this.chart.addPlot('default', {
                         type: 'Columns', // 'Bars'
                         //lines: false, areas: true,
                         //markers: true,
                         hAxis: 'x',
                         vAxis: 'y',
                         //minBarSize: 1,
                         //maxBarSize: 10,
                         gap: 0,
                         outline: { width: 0 },
                         stroke: { width: 0 }});
    this.chart.addSeries("Values", serie, {});
    this.chartAnims = [
      new dojox.charting.action2d.Tooltip(this.chart, 'default'),
      new dojox.charting.action2d.Highlight(this.chart, 'default')
    ];
    this.chart.render();
  },

  clearChart: function() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  },

  /**
   * Update value list [deferred]
   */
  updateValues: function() {
    // while (this.valuesNode.firstChild) {
    //   this.valuesNode.removeChild(this.valuesNode.firstChild);
    // }
    // dojo.place(geonef.jig.makeDOM(
    //     ['table', {'class':'jigList'},
    //       ['tbody', {},
    //         this.data.values.map(
    //           function(value) {
    //             return ['tr', {}, ['td', {}, ''+value]];
    //           }, this)]]), this.valuesNode);
    var exp = this.data.values.join('\n');
    this.valuesInput.attr('value', exp);
  },

  formatNum: function(num) {
    return Math.round(num * 100) / 100;
  },


});
