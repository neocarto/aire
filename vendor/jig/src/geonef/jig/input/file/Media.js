dojo.provide("geonef.jig.input.file.Media");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("geonef.jig.input.file.Upload");

dojo.declare("geonef.jig.input.file.Media", [ dijit._Widget, dijit._Templated ],
{
  // Summary:
  //    Sexy representation of a media (<div> with icon + size + type ...)
  //
  // Description:
  //    The media upload widget is built when requested, to let the user
  //    update the media with another file.
  //

  name: 'media',

  // dijit._Templated HTML template file
  templatePath: dojo.moduleUrl('geonef.jig.input.file', 'templates/Media.html'),

  // Whether we have widgets (attr dojoType="...")
  widgetsInTemplate: true,

  // Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap),
    {
      title: { node: 'titleNode', type: 'innerHTML' },
      contentType: { node: 'contentTypeNode', type: 'innerHTML' },
      size: { node: 'sizeNode', type: 'innerHTML' },
      notice: { node: 'noticeNode', type: 'innerHTML' },
      warning: { node: 'warningNode', type: 'innerHTML' },
      error: { node: 'errorNode', type: 'innerHTML' }
    }),

  notice: null,

  warning: null,

  error: null,

  media: {},

  title: 'File',

  required: true,

  uploadClass: 'timfair.input.media.Upload',

  uploadClassParams: {},

  /***
   ** Getters / Setters
   **
   **************************************************************/


  _setValueAttr: function(media) {
    this.media = media;
    //console.log('_setValueAttr', this, media);
    var struct = dojo.isObject(this.media) ? this.media : {};
    this.uploadButton.attr('label', this.getI18nMsg(
    			     struct.id ? 'uploadNew' : 'uploadFirst'));
    this.attr('contentType', struct.id ?
	      (struct.contentType ? struct.contentType : '') :
	      this.getI18nMsg('noFile'));
    this.attr('size', struct.size ?
	      '' + struct.size + ' ' + this.getI18nMsg('sizeUnit') : '');
    this.thumbnailImageNode.src = null;
    this.thumbnailImageNode.src = struct.id ?
      struct.thumbnailUrl : //'/image/media/format/file.png' :
      '/image/media/format/missing.png';
    var self = this;
    dojo.forEach(['notice', 'warning', 'error'], function(type) {
		   self.attr(type, self.media && self.media.messages ?
			     self.media.messages[type] : null);
		 });
  },

  _getValueAttr: function() {
    if (!this.media || !this.media.id) {
      return null;
    }
    return this.media;
  },

  _setNoticeAttr: function(value) {
    this.__setMessageAttr('notice', value);
  },
  _setWarningAttr: function(value) {
    this.__setMessageAttr('warning', value);
  },
  _setErrorAttr: function(value) {
    this.__setMessageAttr('error', value);
  },

  __setMessageAttr: function(name, value) {
    //console.log('__setMessageAttr', arguments);
    this[name] = value;
    var node = this[name + 'Node'];
    if (dojo.isString(value) && value.length > 0) {
      dojo.style(node, 'display', '');
      node.innerHTML = value.replace("\n", "<br/>");
    } else {
      dojo.style(node, 'display', 'none');
      node.innerHTML = '';
    }
  },

  /***
   ** Actions
   **
   **************************************************************/


  uploadNewVersion: function() {
    //console.log('uploadNewVersion', this);
    var Class = dojo.getObject(this.uploadClass);
    this.uploadWidget = new Class(this.uploadClassParams);
    //dojo.connect(this.uploadWidget, 'startSending', this, 'onUploadStart');
    dojo.connect(this.uploadWidget, 'onChange', this, 'onUploadChange');
    dojo.connect(this.uploadWidget, 'onUploadCancelButtonClick',
    		 this, 'onCancelUpload');
    dojo.connect(this.uploadWidget, 'onUploadError', this, 'onUploadError');
    dojo.connect(this.uploadWidget, 'onUploadTransportError', this, 'onUploadError');
    dojo.style(this.actionNode, 'display', 'none');
    dojo.place(this.uploadWidget.domNode, this.domNode);
    this.uploadWidget.startup();
  },

  destroyUploadWidget: function() {
    if (this.uploadWidget) {
      this.uploadWidget.destroy();
      this.uploadWidget = null;
      dojo.style(this.actionNode, 'display', '');
    }
  },

  isValid: function() {
    return this.media && !this.media.error;
  },


  /***
   ** Event handlers
   **
   **************************************************************/

  /*onUploadStart: function() {
   },*/

  onCancelUpload: function() {
    this.destroyUploadWidget();
  },

  onUploadChange: function() {
    this.attr('value', this.uploadWidget ?
    	      this.uploadWidget.attr('value') : null);
    this.destroyUploadWidget();
  },

  onUploadError: function(msg) {
    //alert('Sorry, an error happened.');
    this.attr('value', {});
    this.attr('error', msg);
    this.destroyUploadWidget();
  },

  onMouseOver: function() {
    dojo.addClass(this.domNode, 'timfairInputMediaGenericHover');
  },

  onMouseOut: function() {
    dojo.removeClass(this.domNode, 'timfairInputMediaGenericHover');
  }


});
