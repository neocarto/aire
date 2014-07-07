
dojo.provide('geonef.jig.list.edition.AutoProperties');

// parents
dojo.require('geonef.jig.list.edition.Abstract');
dojo.require('geonef.jig.list.edition._AutoPropertiesEmbed');
dojo.require('geonef.jig.widget.ButtonContainerMixin');

// code
dojo.require('geonef.jig.util');
dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('geonef.jig.list.edition.tool.ApplyProperty');
dojo.require('geonef.jig.data.tool.LocaleSwitch');

dojo.declare('geonef.jig.list.edition.AutoProperties',
             [geonef.jig.list.edition.Abstract,
              geonef.jig.list.edition._AutoPropertiesEmbed,
              geonef.jig.widget.ButtonContainerMixin],
{
  // summary:
  //   Autoamtically manage a list of properties
  //

  hideControlButtons: false,

  localeSelect: false,

  locale: '',

  templateString: dojo.cache('geonef.jig.list.edition',
                             'templates/AutoProperties.html'),

  postMixInProperties: function() {
    if (!this.locale) {
      this.locale = geonef.jig.locale.getLocale();
    }
    this.inherited(arguments);
  },

  buildButtons: function() {
    this.inherited(arguments);
    var self = this;
    if (this.localeSelect) {
      this.localeButton = new geonef.jig.data.tool.LocaleSwitch(
            { locale: this.locale,
              onChange: function(l) { self.changeLocale(l, true); } });
      this.addButton(this.localeButton, 'general');
    }
  },

  changeLocale: function(locale, fromSelector_) {
    this.locale = locale;
    if (this.localeButton) {
      this.localeButton.attr('locale', locale, true);
    }
    this.loadValues();
  },

  _setHideControlButtonsAttr: function(hide) {
    dojo.style(this.generalNode, 'display', hide ? 'none' : '');
  },


});
