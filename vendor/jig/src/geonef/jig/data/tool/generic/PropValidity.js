
dojo.provide('geonef.jig.data.tool.generic.PropValidity');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in template
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');

dojo.declare('geonef.jig.data.tool.generic.PropValidity',
             [ dijit._Widget, dijit._Templated ],
{

  /**
   * Field name
   *
   * @type {string}
   */
  field: '',

  /**
   * List of errors for the property
   *
   * @type {?Array.<string>}
   */
  error: null,

  /**
   * @type {boolean}
   */
  showSummary: false,

  templateString: dojo.cache('geonef.jig.data.tool.generic',
                             'templates/PropValidity.html'),

  widgetsInTemplate: true,

  _setErrorAttr: function(error) {
    //console.log('_setErrorAttr', this, arguments);
    this.error = error;
    this._setValidity(!error);
    this._setMsg(error);
  },

  _setValidity: function(state) {
    //console.log('setValidity', arguments);
    dojo.removeClass(this.domNode, 'valid invalid');
    if (state !== null && state !== undefined) {
      dojo.addClass(this.domNode, state ? 'valid' : 'invalid');
      this.button.attr('disabled', false);
    } else {
      this.button.attr('disabled', true);
    }
  },

  _setMsg: function(error) {
    //console.log('_setMsg', this, arguments);
    var s = geonef.jig.data.tool.generic.PropValidity.prototype.getError(error);
    this.messageNode.innerHTML = s.message;
    this.detailNode.innerHTML = s.detail;
    this.summaryNode.innerHTML = s.summary;
  },

  _setShowSummaryAttr: function(state) {
    //console.log('_setShowSummaryAttr', this, arguments);
    this.showSummary = state;
    dojo.style(this.summaryNode, 'display', state ? '' : 'none');
  }

});

/**
 * Return structure with formatted messages for error
 *
 * @param {Array.<string>}
 * @return {{ summary: !string, message: !string, detail: ?string }}
 */
geonef.jig.data.tool.generic.PropValidity.prototype.getError =
  function(error) {
    var dic = {
      missing: ["Manquant", "Ce paramètre est obligatoire."],
      invalid: ["Invalide",
                "La valeur de ce paramètre n'est pas correcte&nbsp;:"]
    };
    var message, detail = '', summary;
    if (error) {
      if (!dojo.isArray(error)) { error = [error]; }
      var err = error[0].split(':');
      var msg = dic[err[0]];
      if (msg) {
        summary = msg[0];
        message = msg[1];
      } else {
        summary = "Invalide";
        message = "Erreur - "+error[0];
      }
      if (error[1]) {
        detail = error[1];
      }
    } else {
      summary = "Valide";
      message = "Ce paramètre est valide.";
    }
    return { summary: summary, message: message, detail: detail };
  };
