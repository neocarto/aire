
dojo.provide('geonef.ploomap.list.record.ColorFamily');

// parent
dojo.require('geonef.jig.list.record.Abstract');

// used in template
dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('geonef.jig.button.InstanciateAnchored');
dojo.require('geonef.jig.input.BooleanCheckBox');

dojo.declare('geonef.ploomap.list.record.ColorFamily', geonef.jig.list.record.Abstract,
{
  templateString: dojo.cache('geonef.ploomap.list.record',
                             'templates/ColorFamily.html'),

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    uuid: { node: 'uuidNode', type: 'innerHTML' },
    title: { node: 'titleNode', type: 'innerHTML' },
  }),

  uuid: '!',
  title: '!',
  colors: [],

  _setColorsAttr: function(colors) {
    //console.log('_setColorsAttr', this, arguments);
    this.colors = colors ? colors : [];
    this.colorsNode.innerHTML = '';
    if (!colors) { return; }
    var set = [];
    //colors.forEach(function(s) { if (s.length > set.length) { set = s; }; });
    colors.forEach(
      function(set) {
    set.forEach(
      function(color) {
        dojo.create('span',
          { style: 'background-color: '+color, innerHTML: '&nbsp;&nbsp;' },
          this.colorsNode);
      }, this);
        dojo.create('span', { innerHTML: '&nbsp;&nbsp;' }, this.colorsNode);
        }, this);
    //this.colorsNode.innerHTML = colors.length;
  }

});
