dojo.provide('geonef.jig.clipboard');

geonef.jig.clipboard = {

  push: function(key, value) {
    var fullKey = 'clipboard.' + key;
    geonef.jig.clipboard.setCookieKey(fullKey, value);
  },

  fetch: function(key) {
    var fullKey = 'clipboard.' + key;
    return geonef.jig.clipboard.getCookieKey(fullKey);
  },

  getCookieKey: function(name) {
    var cookie = dojo.cookie('clipboard'),
    data;
    if (!cookie) {
      data = {};
    } else {
      data = dojo.fromJson(cookie);
      if (!dojo.isObject(data)) {
    	data = {};
      }
    }
    //console.log('get cookie', data, cookie);
    return dojo.getObject(name, false, data);
  },

  setCookieKey: function(name, value) {
    var cookie = dojo.cookie('clipboard'),
    data;
    if (!cookie) {
      data = {};
    } else {
      data = dojo.fromJson(cookie);
      if (!dojo.isObject(data)) {
    	data = {};
      }
    }
    //console.log('get cookie', data, cookie);
    dojo.setObject(name, value, data);
    var json = dojo.toJson(data);
    dojo.cookie('clipboard', json/*, { domain: '.catapatate.net' }*/);
    //console.log('set cookie', data, json);
  }

};
