
dojo.provide('geonef.jig.test.Api');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.Button');
dojo.require('geonef.jig.api');

dojo.declare('geonef.jig.test.Api', [dijit._Widget, dijit._Templated],
{
  title: 'API test',

  templatePath: dojo.moduleUrl('geonef.jig.test', 'templates/Api.html'),

  widgetsInTemplate: true,

  /*constructor: function() {
   console.log('API test', this);
   },*/

  startup: function() {
    this.inherited(arguments);
    console.log('startup', this);
  },

  callApi: function() {
    console.log('callApi', this);
    var api = this.moduleTextBox.attr('value');
    var request = this.getStructure();
    console.log('request structure', request, api);
    request.callback = dojo.hitch(this, 'callback');
    request.transportError = dojo.hitch(this, 'transportError');
    geonef.jig.api.request(request, { /*url: api*/ });
  },

  callback: function() {
    console.log('geonef.jig.test.Api: callback', arguments);
    return true;
  },

  transportError: function() {
    console.log('geonef.jig.test.Api: transportError', arguments);
  },

  getStructure: function() {
    var request = {};
    dojo.query('tr', this.bodyNode)
      .forEach(function(tr) {
		 var ws = dojo.query('td > input', tr)
		   .map(function(w) { return dijit.byNode(w); });
		 //.map(function(tb) { return tb.attr('value'); });
		 //console.log(ws);
		 var pair = [ws[0].attr('value'), ws[1].attr('value')];
		 //console.log(pair);
		 if (pair[0].length) {
		   request[pair[0]] = pair[1];
		 }
	       });
    return request;
  },

  addRow: function() {
    var tr = dojo.create('tr', {}, this.bodyNode),
    rows = [1,2].forEach(function(x) {
			   var td = dojo.create('td', {}, tr),
			   tb = dojo.create('input', {}, td),
			   wi = new dijit.form.TextBox({}, tb);
			 });
  }

});
