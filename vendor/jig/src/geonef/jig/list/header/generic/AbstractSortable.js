dojo.provide('geonef.jig.list.header.generic.AbstractSortable');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.list.header.generic.AbstractField');

dojo.declare('geonef.jig.list.header.generic.AbstractSortable',
             [dijit._Widget, dijit._Templated,
              geonef.jig.list.header.generic.AbstractField],
{

  /**
   * Attribute map (dijit._Widget)
   */
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    title: { node: 'titleNode', type: 'innerHTML' }
  }),

  /**
   * Whether we have widgets (attr dojoType="...")
   */
  widgetsInTemplate: true,

  /**
   * Title of field
   */
  title: '',

  /**
   * Value for this thead/tr/td's "colspan" attribute
   */
  colspan: 1,

  /**
   * Whether the field is currently sorted
   */
  sortEnabled: false,

  /**
   * Whether the sort is order is ascending (if this.sortEnabled == true)
   */
  descSort: false,

  /*postMixInProperties: function() {
    this.inherited(arguments);
    //this.title = this.title; //this.getI18nMsg('title');
  },*/

  postCreate: function() {
    this.inherited(arguments);
    this.setupUI();
    this.setSorting(this.sortEnabled ? this.descSort : null);
  },

  setupUI: function() {
    dojo.query('.sortCmd', this.domNode)
      .connect('onmouseover', this, function(evt) {
		 dojo.addClass(this.domNode, this.descSort !== this.sortEnabled ?
			       'hoverAsc' : 'hoverDesc');
	       })
      .connect('onmouseout', this, function(evt) {
		 dojo.removeClass(this.domNode, 'hoverAsc');
		 dojo.removeClass(this.domNode, 'hoverDesc');
	       });
  },

  toggleSort: function() {
    //console.log('toggleSort(): this.descSort',this.descSort);
    //console.log('toggleSort()', this.title,
    //			this.descSort, this.sortEnabled, this.descSort !== this.sortEnabled);
    this.setSorting(this.descSort !== this.sortEnabled);
  },

  setSorting: function(desc) {
    if (desc === null) {
      this.sortEnabled = false;
      dojo.removeClass(this.domNode, 'sorted');
      dojo.removeClass(this.domNode, 'sortedAsc');
      dojo.removeClass(this.domNode, 'sortedDesc');
      dojo.addClass(this.domNode, 'unsorted');
    } else {
      this.descSort = !!desc;
      this.sortEnabled = true;
      //console.log('enabled sort', this, arguments);
      dojo.addClass(this.domNode, 'sorted');
      dojo.removeClass(this.domNode, 'sorted'+(this.descSort?'Asc':'Desc'));
      dojo.addClass(this.domNode, 'sorted'+(this.descSort?'Desc':'Asc'));
    }
    //console.log('setSorting()', this, arguments);
  }

});
