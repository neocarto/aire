dojo.provide('geonef.jig.locale');

dojo.mixin(geonef.jig.locale,
{
  getLocale: function() {
    if (!geonef.jig.locale._locale) {
      var lang = dojo.body().getAttribute('lang');
      if (lang) {
        geonef.jig.locale._locale = lang;
      } else {
        geonef.jig.locale._locale = geonef.jig.locale.getAvailableLocales()[0];
      }
    }
    return geonef.jig.locale._locale;
  },

  getAvailableLocales: function() {
    return ['en', 'fr'];
  }

});
