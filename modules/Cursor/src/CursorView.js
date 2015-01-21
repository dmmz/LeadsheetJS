define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, UserLog, pubsub) {

	function CursorView(parentHTML) {
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
			if (keyCode === 8) {
				var doPrevent = false;
				var d = evt.srcElement || evt.target;
				if (d.tagName.toUpperCase() === 'TEXTAREA' || (d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE'))) {
					doPrevent = d.readOnly || d.disabled;
				} else {
					doPrevent = true;
				}
				if (doPrevent) {
					stopEvent(evt);
				}
			}
			if (keyCode == 37 || keyCode == 39) {
				// left-right arrows
				inc = (keyCode == 39) ? 1 : -1;
				if (evt.shiftKey) {
					$.publish('CursorView-expandSelected', inc);
				} else {
					$.publish('CursorView-moveCursor', inc);
				}
				stopEvent(evt);
			} else if (keyCode == 36) { //begin
				$.publish('CursorView-setCursor', 0);
				stopEvent(evt);
			} else if (keyCode == 35) { //end
				$.publish('CursorView-setCursor', 10000);
				stopEvent(evt);
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
	CursorView.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('CursorModel-setPos', function(el, position) {
			self.drawCursor(position);
		});
	};

	CursorView.prototype.drawCursor = function(position) {
		console.log('CursorView-drawCursor-TODO', position);
	};



	return CursorView;
});