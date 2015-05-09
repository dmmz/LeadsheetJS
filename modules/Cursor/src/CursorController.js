define([
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
], function(songModel, UserLog, pubsub) {

	function CursorController(songModel, model, view) {
		this.songModel = songModel;
		this.model = model || new CursorModel();
		this.view = view;
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	CursorController.prototype.initSubscribe = function() {
		var self = this;
		
		// TODO: revise
		//  $.subscribe('ToAllCursors-setEditable', function(el, isEditable) {
		// 	self.setEditable(isEditable);
		// });
		$.subscribe('Cursor-' + this.view.id, function(el, fn, param) {
			self[fn].call(self,param);
			$.publish('CanvasLayer-refresh', 'scoreCursor');

		});
	};


	/**
	 * set cursor by index
	 * @param {integer} index
	 * @param {string} editMode "notes" or "chords"
	 */
	CursorController.prototype.setCursor = function(index) {
		if (typeof index === "undefined" || isNaN(index)) {
			throw 'CursorController - setCursor - index is not correct ' + index;
		}

		this.model.setPos(index);
		//TODO: change by 'canvaslayer-refresh', working for notes but cannot do it yet because we need to solve some problems for the chords editions
	};

	CursorController.prototype.expandSelected = function(inc) {
		if (typeof inc === "undefined" || isNaN(inc)) {
			throw 'CursorController - expandSelected - inc is not correct ' + inc;
		}
		this.model.expand(inc);
	};

	CursorController.prototype.moveCursor = function(inc) {
		this.setCursor(this.model.getEnd() + inc);
	};
	//TODO: setEditable???
	CursorController.prototype.setEditable = function(isEditable) {
		this.model.setEditable(isEditable);
	};

	return CursorController;
});