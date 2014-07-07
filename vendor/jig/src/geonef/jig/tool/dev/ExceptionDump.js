
dojo.provide('geonef.jig.tool.dev.ExceptionDump');

// parents
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');

// used in template
dojo.require('geonef.jig.input.List');

dojo.declare('geonef.jig.tool.dev.ExceptionDump',
             [ geonef.jig.layout._Anchor, dijit._Templated ],
{
  // summary:
  //   Interactive dump of PHP exception
  //

  title: 'Exception',
  code: -1,
  message: '',
  backtrace: [],
  context: {},

  templateString: dojo.cache('geonef.jig.tool.dev', 'templates/ExceptionDump.html'),
  widgetsInTemplate: true,

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    code: { node: 'codeNode', type: 'innerHTML' },
    message: { node: 'messageNode', type: 'innerHTML' },
  }),

  postMixInProperties: function() {
    this.inherited(arguments);
    this.backtrace = this.backtrace.splice(0);
    this.context = dojo.mixin({}, this.context);
  },

  _setContextAttr: function(context) {
    this.context = context;
    //var json = dojo.toJson(context);
    //this.contextNode.innerHTML = json;
  },

  _setBacktraceAttr: function(backtrace) {
    this.backtrace = backtrace;
    this.btCallList.attr('value', backtrace);
  },

  dump: function() {
    console.log(this); // sic
  },

  dumpContext: function() {
    console.log('Context:', this.context);
  },


});


///////////////////////////////////////////////


dojo.provide('geonef.jig.tool.dev._ExceptionDumpBtCall');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('geonef.jig.tool.dev._ExceptionDumpBtCall',
             [ dijit._Widget, dijit._Templated ],
{
  // summary:
  //   Interactive dump of PHP exception
  //

  templateString: dojo.cache('geonef.jig.tool.dev', 'templates/_ExceptionDumpBtCall.html'),
  widgetsInTemplate: true,

  file: '',
  line: -1,
  type: '',
  'class': '',
  function: '',
  args: [],

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    file: { node: 'fileNode', type: 'innerHTML' },
    line: { node: 'lineNode', type: 'innerHTML' },
    //type: { node: 'typeNode', type: 'innerHTML' },
    'function': { node: 'functionNode', type: 'innerHTML' },
  }),

  postMixInProperties: function() {
    this.inherited(arguments);
    this.args = this.args.splice(0);
  },

  _setValueAttr: function(value) {
    for (p in value) {
      if (value.hasOwnProperty(p)) {
        this.attr(p, value[p]);
      }
    }
  },

  _setClassAttr: function(_class) {
    this['class'] = _class;
    this.classNode.innerHTML = _class;
  },

  _setArgsAttr: function(args) {
    this.args = args;
    this.argsNode.innerHTML = args.map(dojo.toJson).join(', ');
  },

  dumpArgs: function() {
    console.dir(this.args);
  },


});
