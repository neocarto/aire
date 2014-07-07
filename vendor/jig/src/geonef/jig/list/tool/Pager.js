dojo.provide('geonef.jig.list.tool.Pager');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
//dojo.require('geonef.jig.widget._I18n');

// in template
dojo.require('geonef.jig.button.Action');
dojo.require('dijit.form.HorizontalSlider');
dojo.require('dijit.form.HorizontalRule');
dojo.require('dijit.form.HorizontalRuleLabels');
dojo.require('dijit.form.ComboBox');

/**
 * Pager widget tool for jig lists
 *
 * This pager needs to append some params to the API request,
 * as well as read the response to update the UI (current page,
 * page count, ...).
 *
 * To allow 0 or multiple pagers on a single list, the pager works
 * by subscribing via dojo.subscribe() to the admin list's own topic
 * which is : adminListWidgetId + '/request'
 *
 * @class
 */
dojo.declare('geonef.jig.list.tool.Pager', [ dijit._Widget, dijit._Templated ],
{

  baseMsgKey: 'list.tool.pager',
  //baseMsgKey: 'tForm.common.admin.pager',

  // autoHide: Boolean
  //    If true, pager will hide automatically if page count <=1
  autoHide: false,

  templateString: dojo.cache('geonef.jig.list.tool', 'templates/Pager.html'),

  // widgetsInTemplate: Boolean
  //    Whether we have widgets (attr dojoType="...")
  widgetsInTemplate: true,

  // attributeMap: Object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    title: { node: 'titleNode', type: 'innerHTML' },
    //numResults: { node: 'numResultsNode', type: 'innerHTML' },
    numPages: { node: 'numPagesNode', type: 'innerHTML' },
    currentPage: { node: 'currentPageNode', type: 'innerHTML' }
  }),

  adminWidgetId: '',

  currentPage: 1,

  RULE_ITEMS: 8,

  title: '',

  numPages: -1,

  postCreate: function() {
    this.inherited(arguments);
    /*this.subscrHandler =*/
    this.subscribe('jig/apiRequest', function(s) {
		     this.slider.attr('disabled', !!s);
		   });

  },

  _setAdminWidgetIdAttr: function(widgetId) {
    if (this.subscrHandle) {
      dojo.unsubscribe(this.subscrHandle);
    }
    if (widgetId.length) {
      //console.log('subscribe:', widgetId + '/request');
      this.subscrHandle = dojo.subscribe(widgetId + '/request',
					 this, 'handleRequest');
      this.listWidget = dijit.byId(widgetId);
      this.attr('pageLength', this.listWidget.pageLength);
      this.attr('title', this.listWidget.attr('title'));
    }
  },

  _setPageLengthAttr: function(pageLength) {
    //console.log('_setPageLengthAttr', this, arguments);
    pageLength = parseInt(pageLength, 10);
    if (this.pageLength === pageLength) { return; }
    this.pageLength = pageLength;
    if (this.pageLengthNode) {
      this.pageLengthNode.innerHTML = ''+pageLength;
    }
    if (this.pageLengthInput) {
      this.pageLengthInput.attr('value', pageLength, false);
    }
    this.doRefresh();
  },

  /**
   * Update current page - does NOT initiate a page change
   * (see goToPage())
   */
  _setCurrentPageAttr: function(page) {
    if (this.currentPage === page) {
      return;
    }
    this._noPageChangeAction = true;
    this.currentPage = page;
    this.currentPageNode.innerHTML = page;
    this.slider.attr('value', page);
    this._noPageChangeAction = false;
  },

  _setNumPagesAttr: function(count) {
    if (this.numPages === count) {
      return;
    }
    if (this.numPages < 0 || (this.numPages > 1) !== (count > 1)) {
      if (this.autoHide) {
        dojo.style(this.domNode.parentNode &&
                   this.domNode.parentNode.parentNode ?
                   this.domNode.parentNode.parentNode : this.domNode,
                   'display', !count || count === 1 ? 'none' : '');
      } else {
        dojo.query('> table > tbody > tr > td.browsePage', this.domNode)
          .style('display', count > 1 ? '' : 'none');
      }
    }
    this.numPages = count;
    this.numPagesNode.innerHTML = count;
    this.slider.attr('maximum', count);
    this.slider.attr('discreteValues', count);
    this.slider.attr('value', this.slider.attr('value'));
    var dCount = Math.min(count, this.RULE_ITEMS);
    this.sliderRule.attr('count', dCount);
    this.sliderRule.postCreate();
    if (!this.sliderRuleLabels.srcNodeRef) {
      this.sliderRuleLabels.srcNodeRef = dojo.create('div');
    }
    this.sliderRuleLabels.attr('count', dCount);
    this.sliderRuleLabels.attr('maximum', count);
    this.sliderRuleLabels.labels = [];
    this.sliderRuleLabels.labels = this.sliderRuleLabels.getLabels();
    this.sliderRuleLabels.postCreate();
  },

  _setNumResultsAttr: function(numResults) {
    if (this.numResults === numResults) { return; }
    this.numResults = numResults;
    this.numResultsNode.innerHTML = numResults;
    window.setTimeout(dojo.hitch(this,
        function() {
          geonef.jig.workspace.highlightNode(this.numResultsGroupNode, 'focus');
          // var box = dojo.coords(this.numResultsGroupNode)
          // , div = dojo.create('div')
          // , effect = geonef.jig.workspace.fx.widget.focus(div, box);
          // dojo.style(div, { position: 'fixed', zIndex: 43000 });
          // dojo.place(div, dojo.body());
          // effect.onEnd = function() { dojo.body().removeChild(div); };
          // effect.play();
        }), 50);
    /*dojo.animateProperty({
      node: this.numResultsNode, duration: 500,
      properties: { opacity: { start: 0.0, end: 1.0 }},
      easing: window._e || dojo.fx.easing.linear
    }).play();*/
  },


  handleRequest: function(request) {
    var self = this,
    prevCallback = request.callback || function() {};
    dojo.mixin(request, {
		 callback: function() {
		   self.handleResponse.apply(self, arguments);
		   prevCallback.apply(self, arguments);
		 }
	       });
    if (this.newPage) {
      request.page = this.newPage;
    } else if (!request.page) {
      request.page = self.attr('currentPage') || 1;
    }
    request.pageLength = this.pageLengthInput.attr('value');
  },

  handleResponse: function(response) {
    var self = this;
    ['pageLength', 'numPages', 'numResults', 'currentPage'].forEach(
      function(attr) {
	self.attr(attr, response[attr]);
      });
  },

  /**
   * Initiate page change
   */
  goToPage: function(page) {
    //console.log('goToPage', this, arguments);
    if (page === this.currentPage) {
      //console.log('same', this, arguments);
      return;
    }
    if (this._noPageChangeAction) {
      //console.log('abort', this, arguments);
      return;
    }
    //this._noPageChangeAction = true;
    this.currentPageNode.innerHTML = 'X';
    this.newPage = page;
    this.attr('currentPage', page);
    this.doRefresh();
    //this._noPageChangeAction = false;
    this.newPage = null;
  },

  doRefresh: function() {
    this.listWidget.refresh();
  },

  goToFirst: function() {
    this.goToPage(1);
  },

  goToPrevious: function() {
    this.goToPage(this.attr('currentPage') - 1);
  },

  goToNext: function() {
    this.goToPage(this.attr('currentPage') + 1);
  },

  goToLast: function() {
    this.goToPage(this.attr('numPages'));
  },

  onSliderChange: function() {
    var page = this.slider.attr('value');
    this.goToPage(page);
  }

});
