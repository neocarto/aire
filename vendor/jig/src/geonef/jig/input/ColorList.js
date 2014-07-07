
dojo.provide('geonef.jig.input.ColorList');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.input._Container');

// used in template
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
dojo.require('dijit.form.NumberSpinner');

// used in code
dojo.require('geonef.jig.input.Color');

dojo.declare('geonef.jig.input.ColorList',
             [ dijit._Widget, dijit._Templated, geonef.jig.input._Container ],
{
  // summary:
  //   List of colors
  //

  maxCount: 20,

  nullLabel: 'Couleurs...',

  arrayContainer: true,

  templateString: dojo.cache('geonef.jig.input', 'templates/ColorList.html'),

  widgetsInTemplate: true,

  postMixInProperties: function() {
    this.savedValues = [];
    this.inherited(arguments);
  },

  startup: function() {
    this.inherited(arguments);
    this.updateLabel();
  },

  getInputRootNodes: function() {
    return [ this.listNode ];
  },

  _setValueAttr: function(list) {
    //console.log('_setValueAttr', this, arguments);
    this.attr('count', list ? list.length : 0);
    this.inherited(arguments);
  },

  _getCountAttr: function() {
    var value = this.attr('value');
    return value.length;
  },

  _setCountAttr: function(count) {
    /*if (this.count === count) {
      return;
    }*/
    var value = this.attr('value');
    var inputs = dojo.query('> *', this.listNode)
      .map(dijit.byNode);
    var i, input;
    // save current values
    for (i = 0; i < value.length; ++i) {
      if (i < this.savedValues.length) {
        this.savedValues[i] = value[i];
      } else {
        this.savedValues.push(value[i]);
      }
    }
    // remove inputs if needed
    for (i = count; i < inputs.length; ++i) {
      inputs[i].destroy();
    }
    // add inputs if needed
    for (i = inputs.length; i < count; ++i) {
      input = new geonef.jig.input.Color;
      input.placeAt(this.listNode);
      input.startup();
      if (i < this.savedValues.length) {
        input.attr('value', this.savedValues[i]);
      }
    }
    this.updateChildren();
    // updates ...
    this.countSpinner.attr('value', count);
    this.updateLabel();
  },

  onCountSpinnerChange: function() {
    var count = this.countSpinner.attr('value');
    if (count === this.count) {
      return;
    }
    this.attr('count', count);
  },

  onChange: function() {
    this.inherited(arguments);
    this.updateLabel();
  },

  updateLabel: function() {
    var value = this.attr('value')
    , l = value.length
    , pct = 100 / l
    , width = 80
    , height = 12;
    //console.log('updateLabel', this, arguments);
    if (l) {
      this.button.containerNode.innerHTML = '';
      dojo.style(this.button.containerNode, {
                   top: '-5px', width: ''+width+'px' });
      for (var i = 0; i < l; ++i) {
        dojo.create('div', {
                      style: 'position:absolute;width:'+pct+'%;'+
                        'height:'+height+'px;left:'+(pct*i)+'%;'+
                        'background-color:'+value[i]+';'
                    }, this.button.containerNode);
      }
    } else {
      dojo.style(this.button.containerNode, {
                   top: 'auto', width: 'auto' });
      this.button.containerNode.innerHTML = this.nullLabel;
    }
  },

  autoGenerate: function() {
    var color1 = this.autoColorStart.attr('value');
    var color2 = this.autoColorEnd.attr('value');
    if (!color1 || !color2) {
      alert('La couleur de début et celle de fin doivent être\n'+
            'définies pour la génération automatique !');
      return;
    }
    var count = this.attr('count');
    if (!count) {
      alert('Le nombre de couleurs doit être être strictement positif !');
      return;
    }
    var col2ar = function(hex) {
      return [hex.substr(1,2), hex.substr(3,2),
              hex.substr(5,2)].map(function(h) { return parseInt(h, 16); });
    };
    var ar2col = function(ar) {
      var intToHex = function(i) {
        var v = parseInt(i).toString(16);
        if (v.length === 1) { v = '0' + v; }
        return v;
      };
      return '#' + ar.map(intToHex).join('');
    };
    //window.col2ar = col2ar;
    var cc = [color1, color2].map(col2ar);
    var c1 = col2ar(color1);
    var c2 = col2ar(color2);
    var diff = [0,1,2].map(function(p) { return c2[p]-c1[p]; });
    var itv = diff.map(function(d) { return d / count; });
    var colors = [color1];
    for (var i = 1; i < count - 1; ++i) {
      var colA = [0,1,2].map(function(p) { return c1[p] + i * itv[p]; });
      var col = ar2col(colA);
      colors.push(col);
    }
    colors.push(color2);
    this.attr('value', colors);
  }


});
