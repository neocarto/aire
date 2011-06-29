
dojo.provide('aire.app.home');

dojo.require('dojo.hash');
dojo.require('dojo.i18n');
dojo.requireLocalization('aire', 'app');


/*
 * Provide app management & global AIRE actions
 */
dojo.mixin(aire.app, {

  showContent: function(path) {
    console.log('showContent', arguments);
    if (path === true) {
      path = '';
    }
    if (dojo.isString(path)) {
      if (path === '') {
        path = 'index.'+aire.app.locale+'.php';
      }
      this.contentFrame.src = '/data/home/'+path;
    }
    aire.app.setLayout('layoutContent');
    //dojo.hash(dojo.isString(path) ? 'content/'+path : 'content');
  },

  init: function() {
    aire.app.i18n = dojo.i18n.getLocalization('aire', 'app');
    aire.app.locale = dojo.body().getAttribute('lang');
    this.contentFrame = dojo.byId('contentFrame');
    console.log('contentFrame', this, this.contentFrame);
    dojo.connect(this.contentFrame, 'onload', this.contentFrame,
                 function() {
                   //var path =  this.src.replace(/https?:\/\/[^/]+\/data\/content\//, '');
                   var path =  this.contentWindow.location.pathname
                     .replace(/\/data\/home\//, '');
                   //console.log('onload!', this, arguments, path);
                   if (path) {
                     dojo.hash('content/'+path);
                   }
                 });
  },

  start: function() {
  },

  onHashChange: function(hash) {
    console.log('onHashChange', this, arguments);
    var handlers = {
      content: function(p) {
        if (p.length > 0) {
          var path = p.join('/');
          aire.app.showContent(path);
        } else {
          aire.app.showContent();
        }
      }
    };

    var p = hash.split('/');
    var name = p.shift();
    if (!handlers[name]) {
      console.warn("hash not handled:", hash);
      return;
    }
    handlers[name](p);
  }

});
