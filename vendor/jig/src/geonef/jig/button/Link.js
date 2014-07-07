
dojo.provide('geonef.jig.button.Link');

// parents
dojo.require('dijit._Widget');

dojo.declare('geonef.jig.button.Link', dijit._Widget,
{
  /**
   * Link label, HTML supported (innerHTML)
   *
   * @type {string}
   */
  label: '',

  /**
   * Content of 'title' tooltip
   *
   * @type {string}
   */
  title: '',

  /**
   * If set, onExecute will (dojo.)publish a message on the given channel
   *
   * @type {string}
   */
  publish: '',

  /**
   * Additional CSS classes to set
   *
   * @type {string}
   */
  cssClasses: '',

  /**
   * If set, a confirmation is asked on mouseClick before calling onExecute
   */
  confirm: '',

  /**
   * Name of element to create, unless one of 'srcNodeRef' or 'href' is provided
   *
   * @type {string}
   */
  nodeName: 'span',

  /**
   * If provided, an <a> element is created rather than <span>
   * (whatever is the value of 'nodeName')
   *
   * @type {string}
   */
  href: '',

  target: '',

  buildRendering: function() {
    //console.log('buildRendering', this, arguments);
    if (this.srcNodeRef) {
      this.domNode = dojo.create(this.srcNodeRef.nodeName);
      dojo.forEach(this.srcNodeRef.childNodes,
          function(node) { this.domNode.appendChild(node); }, this);
    } else {
      if (this.href) {
        this.domNode = dojo.create('a', { href: this.href });
      } else {
        this.domNode = dojo.create(this.nodeName);
      }
    }
    if (this.label) {
      this.domNode.innerHTML = this.label;
    }
    dojo.addClass(this.domNode, 'link '+this.cssClasses);
    if (this.domNode.nodeName !== 'A') {
      this.connect(this.domNode, 'onclick', 'onClick');
    }
  },

  _setLabelAttr: function(label) {
    this.label = label;
    if (label) {
      this.domNode.innerHTML = label;
    }
  },

  _setTitleAttr: function(title) {
    this.title = title;
    this.domNode.title = title;
  },

  _setHrefAttr: function(href) {
    this.href = href;
    this.domNode.href = href;
  },

  _setTargetAttr: function(target) {
    this.target = target;
    this.domNode.target = target;
  },

  _setDisabledAttr: function(state) {
    this.disabled = state;
    (state ? dojo.addClass : dojo.removeClass)(this.domNode, 'disabled');
  },


  onClick: function(event) {
    dojo.stopEvent(event);
    if (this.disabled) { return; }
    if (!this.confirm ||
        window.confirm(this.confirm)) {
      this.onExecute();
    }
  },

  onExecute: function() {
    if (this.publish) {
      dojo.publish(this.publish, []);
    }
  },

  _setEmphasizeAttr: function(state) {
    (state ? dojo.addClass : dojo.removeClass)(this.domNode, 'emphasize');
  },


});
