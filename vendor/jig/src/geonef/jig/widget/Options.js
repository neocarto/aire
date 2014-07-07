
// OLD CODE

dojo.provide('geonef.jig.widget.Options');

//dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('dijit._Templated');
dojo.require('dijit._Widget');
dojo.require('dijit.form.Button');
dojo.require('geonef.jig.layout.AnchorButton');

dojo.declare('geonef.jig.widget.Options',
	[ dijit._Widget, dijit._Templated ], {

	templateString: dojo.cache("geonef.jig.widget", "templates/Options.html"),

	widgetsInTemplate: true,

	relatedWidget: null,

	postCreate: function() {
          throw new Error('Old code!');
		this.inherited(arguments);
		if (this.relatedWidget.widgetOptionsClass) {
			var _Class = dojo.isString(this.relatedWidget.widgetOptionsClass) ?
							dojo.getObject(this.relatedWidget.widgetOptionsClass) :
							this.relatedWidget.widgetOptionsClass;
			this.cacoinOptionWidget = new _Class(
					{ relatedWidget: this.relatedWidget, _floatAnchor: true },
					this.cacoinNode);
			this.cacoinOptionWidget._floatAnchor = true;
		}
	},

	startup: function() {
		this.inherited(arguments);
		if (this.cacoinOptionWidget) {
			this.cacoinOptionWidget.startup();
		}
	},


	// UI actions

	closeCacoin: function() {
		console.log('closeCacoin', this, this.relatedWidget);
		this.relatedWidget.destroy();
		this.relatedWidget = null;
	}



});
