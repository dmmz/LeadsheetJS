define([
	"jquery",
	'pubsub',
], function($, pubsub) {
	/**
	 * Cursor manages all cursor edition function
	 * @exports Cursor/CursorController
	 */
	function CursorController(model, view) {
		this.model = model || new CursorModel();
		this.view = view;
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	CursorController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('Cursor-' + this.view.id, function(el, fn, param) {
			if (self.model.getEditable()) {
				self[fn].call(self, param);
				$.publish('CanvasLayer-refresh');
			}
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

	CursorController.prototype.setEditable = function(isEditable) {
		this.model.setEditable(isEditable);
	};

	return CursorController;
});