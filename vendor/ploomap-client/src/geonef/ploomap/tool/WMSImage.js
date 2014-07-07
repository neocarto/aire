dojo.provide('geonef.ploomap.tool.WMSImage');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('geonef.ploomap.tool.WMSImage', [dijit._Widget, dijit._Templated], {

	format: 'image/png',
	maxSize: 200,
	altTitle: 'WMS Image',
	serviceURL: '',
	extent: null,
	templateString: '<img src="" alt="WMS" class="wms"/>',

	startup: function() {
		this.updateImageLocation();
		this.inherited(arguments);
	},

	updateImageLocation: function() {
		if (!this.extent)
			return false;
		this.domNode.alt = this.altTitle;
		var s = this.extent.getSize();
		var params = {
			FORMAT: this.format,
			BBOX: this.extent.toBBOX(),
			WIDTH: parseInt(s.w > s.h ? this.maxSize : this.maxSize * s.w / s.h),
			HEIGHT: parseInt(s.h > s.w ? this.maxSize : this.maxSize * s.h / s.w),
			TRANSPARENT: 'true',
			SERVICE: 'WMS',
			VERSION: '1.1.1',
			REQUEST: 'GetMap'
		};
		this.domNode.src = this.serviceURL + '?' + dojo.objectToQuery(params);
	}
});
