dojo.provide('geonef.jig.widget.I18nMixin');

dojo.require('dojo.i18n');

/**
 * Widget I18n functions, providing the msgKey="" and trans() facilities
 */
dojo.declare('geonef.jig.widget.I18nMixin', null,
{

  i18nModule: '',
  i18nDomain: '',

  i18nTemplateSubstitution: true,

  i18nKeepMsgAttrs: false,

  postMixInProperties: function() {
    this.inherited(arguments);
    //console.log('i18n', this, arguments, this.lang);
    this.i18n = dojo.i18n.getLocalization(this.i18nModule, this.i18nDomain,
                                          this.lang);
  },

  /**
   * Process DOM elements witg [msgKey] attribute
   */
  makeI18nSubstitutions: function() {
    var self = this;
    dojo.query('[msgKey]', this.domNode)
      .forEach(function(el) {
		 var key = el.getAttribute('msgKey');
		 try {
		   el.innerHTML = self.trans(key, self);
		 }
		 catch (e) {
		   console.carn('Error while processing message', key,
                                'on element', el, 'for widget', self);
		 }
                 if (!self.i18nKeepMsgAttrs) {
                   el.removeAttribute('msgKey');
                 }
	       });
  },

  /**
   * Hack for correct hook when dijit._Templated is used
   *
   * @todo not optimized: this method is probably called twice..
   */
  _attachTemplateNodes: function() {
    if (this.i18nTemplateSubstitution) {
      this.makeI18nSubstitutions();
    }
    this.inherited(arguments);
  },

  /**
   * Return translation for key
   */
  trans: function(k, obj) {
    var trans = dojo.getObject(k, false, this.i18n);
    //console.log('trans', k, trans, this.i18n);
    if (trans) {
      if (obj) {
        trans = dojo.string.substitute(trans, obj);
      }
    } else {
      console.warn('no translation for key:', k, ', in i18n bundle '+
                   this.i18nModule+'/'+this.i18nDomain, this.i18n);
      trans = k;
    }
    return trans;
  }

});
