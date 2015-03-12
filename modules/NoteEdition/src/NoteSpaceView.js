define([
	'utils/ChordUtils',
	'utils/UserLog',
	'pubsub',
	'jquery_autocomplete',
], function(ChordUtils, UserLog, pubsub, jquery_autocomplete) {

	function NoteSpaceView(viewer, position) {
		this.viewer = viewer;
		this.initSubscribe();
		this.position = position;
	}

	/**
	 * Publish event after receiving dom events
	 */
	NoteSpaceView.prototype.initController = function() {
		// there are two controllers, one on input onselect, the other on blur event
	};

	NoteSpaceView.prototype.initKeyboard = function(evt) {};

	/**
	 * Subscribe to model events
	 */
	NoteSpaceView.prototype.initSubscribe = function() {};

	NoteSpaceView.prototype.isInPath = function(x, y) {
		if (typeof x !== "undefined" && !isNaN(x) && typeof y !== "undefined" && !isNaN(y)) {
			if (this.position.x <= x && x <= (this.position.x + this.position.xe) && this.position.y <= y && y <= (this.position.y + this.position.ye)) {
				return true;
			}
		}
		return false;
	};

	return NoteSpaceView;
});