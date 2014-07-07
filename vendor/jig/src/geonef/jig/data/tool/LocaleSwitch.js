
dojo.provide('geonef.jig.data.tool.LocaleSwitch');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in code
dojo.require('geonef.jig.locale');
dojo.require('geonef.jig.button.Action');

/**
 * Provides a way to switch between languages for display language
 *
 * This only affects the language-dependant colomns of list content.
 * This tool hooks before list request sending, and add the 'locale' parameter.
 *
 * @class
 */
dojo.declare('geonef.jig.data.tool.LocaleSwitch',
             [ dijit._Widget, dijit._Templated ],
{
  locale: '',

  readOnly: false,

  listWidget: '',

  /** inherited */
  templateString: dojo.cache('geonef.jig.data.tool', 'templates/LocaleSwitch.html'),

  /** inherited */
  widgetsInTemplate: true,

  postMixInProperties: function() {
    this.inherited(arguments);
    if (!this.locale) {
      this.locale = geonef.jig.locale.getLocale();
    }
  },

  buildRendering: function() {
    this.inherited(arguments);
    this.populateLocales();
  },


  _setListWidgetAttr: function(widget) {
    if (this.subscrHandle) {
      dojo.unsubscribe(this.subscrHandle);
    }
    if (!widget) { return; }
    this.listWidget = dojo.isString(widget) ? dijit.byId(widget) : widget;
    this.subscrHandle = dojo.subscribe(this.listWidget.id + '/request',
                                       this, 'handleRequest');
  },

  /* used with this.listWidget */
  handleRequest: function(request) {
    request.locale = this.attr('locale');
    //console.log('added request locale:', request.locale, this, arguments);
  },

  _setLocaleAttr: function(locale, silent_) {
    var changed = locale !== this.locale;
    //console.log('_setLocaleAttr', this, arguments, this.locale, changed);
    this.locale = locale;
    this.button.set('label', locale);
    if (changed && !silent_) {
      this.onChange(locale);
    }
  },

  onChange: function(locale) {
    if (this.listWidget) {
      this.listWidget.refresh();
    }
  },

  populateLocales: function() {
    if (this.readOnly) { return; }
    var locales = geonef.jig.locale.getAvailableLocales();
    locales.forEach(
      function(locale) {
        var button = new geonef.jig.button.Action({ label: locale });
        var self = this;
        button.connect(button, 'onClick',
                       function() { self.attr('locale', locale); });
        button.placeAt(this.containerNode);
        button.startup();
      }, this);
  }

});
