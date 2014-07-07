dojo.provide('geonef.jig._Serializable');

//
//  what need ? not used actually... more like a class interface
///////////

dojo.declare('geonef.jig._Serializable', null,
{
	// summary:
	//		mixin class for widgets which can be persisted
	//

	_getStateAttr: function() {
		// summary:
		// 		Save widget state for future restore
		// 		Must return an object
		return {};
	},

	_setStateAttr: function(data) {
		// summary:
		//		Restore previously saved widget state
	}


});
