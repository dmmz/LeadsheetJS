define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, UserLog, pubsub) {

	function CursorView(model, id, keyToNext) {
		this.id = id;
		this.model = model; // Cursor view need information about its model, this is only because draw function is call by an external viewer
		this.keyToNext = (typeof keyToNext !== "undefined") ? keyToNext : 'arrow'; // way to go to previous next, 'arrow' or 'tab', by default it's arrow
		this.initSubscribe();
		this.initController();
		this.initKeyboard();
	}

	/**
	 * Publish event after receiving dom events
	 */
	CursorView.prototype.initController = function() {};

	CursorView.prototype.initKeyboard = function(evt) {
		var self = this;
		$(document).keydown(function(evt) {
			if (self.editing === false) {
				return;
			}
			var keyCode = (evt === null) ? event.keyCode : evt.keyCode;
			var key = String.fromCharCode(keyCode).toLowerCase();

			//prevent backspace
			if (keyCode === 8 || keyCode === 37 || keyCode === 39 || keyCode === 36 || keyCode === 35) {
				var doPrevent = false;
				var d = evt.srcElement || evt.target;
				if (d.tagName.toUpperCase() === 'TEXTAREA' || (d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE'))) {
					doPrevent = !(d.readOnly || d.disabled);
				} else {
					doPrevent = false;
				}
				if (doPrevent === true) {
					return;
				}
			}
			if (self.keyToNext === 'tab') {
				if(keyCode==9) {
					inc = (evt.shiftKey) ? -1 : 1;
					$.publish('CursorView-moveCursor' + self.id, inc);
					stopEvent(evt);
				}
			} else { // arrow
				if (keyCode == 37 || keyCode == 39) {
					// left-right arrows
					inc = (keyCode == 39) ? 1 : -1;
					if (evt.shiftKey) {
						$.publish('CursorView-expandSelected' + self.id, inc);
					} else {
						if (evt.ctrlKey) {
							$.publish('CursorView-moveCursorByElement' + self.id, inc);
						}
						else{
							$.publish('CursorView-moveCursor' + self.id, inc);
						}
					}
					stopEvent(evt);
				} else if (keyCode == 36) { //begin
					if (evt.shiftKey) {
						$.publish('CursorView-expandSelected' + self.id, -10000);
					} else {
						$.publish('CursorView-setCursor' + self.id, 0);
					}
					stopEvent(evt);
				} else if (keyCode == 35) { //end
					if (evt.shiftKey) {
						$.publish('CursorView-expandSelected' + self.id, 10000);
					} else {
						$.publish('CursorView-setCursor' + self.id, 10000);
					}
					stopEvent(evt);
				}
			}
		});

		function stopEvent(evt) {
			evt.preventDefault();
			evt.stopPropagation();
		}
	};


	/**
	 * Subscribe to model events
	 */
	CursorView.prototype.initSubscribe = function() {};

	return CursorView;
});