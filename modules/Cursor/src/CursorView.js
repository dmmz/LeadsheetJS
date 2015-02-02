define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, UserLog, pubsub) {

	function CursorView(model, parentHTML) {
		this.model = model; // Cursor view need information about his model, this is only because draw function is call by an external viewer
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
				if (evt.shiftKey) {
					$.publish('CursorView-expandSelected', -10000);
				} else {
					$.publish('CursorView-setCursor', 0);
				}
				stopEvent(evt);
			} else if (keyCode == 35) { //end
				if (evt.shiftKey) {
					$.publish('CursorView-expandSelected', 10000);
				} else {
					$.publish('CursorView-setCursor', 10000);
				}
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
		$.subscribe('CursorModel-setPos', function(el, position) {});
	};

	CursorView.prototype.draw = function(viewer) {
		var position = this.model.getPos();
		var cursorHeight = 80;
		var cursorMarginTop = 20;
		var cursorMarginLeft = 2;
		var cursorMarginRight = 8;

		var stavePos, pos;
		var saveFillColor = viewer.ctx.fillStyle;
		viewer.ctx.fillStyle = "#0099FF";
		viewer.ctx.globalAlpha = 0.2;
		for (var cInit = position[0], cEnd = position[1]; cInit <= cEnd; cInit++) {
			if (viewer.vxfNotes[cInit].voice !== null) {
				pos = viewer.vxfNotes[cInit].getBoundingBox();
				stavePos = viewer.vxfNotes[cInit].stave;
				viewer.ctx.fillRect(
					pos.x - cursorMarginLeft,
					stavePos.y + cursorMarginTop,
					pos.w + cursorMarginLeft + cursorMarginRight,
					cursorHeight
				);
			}
		}
		viewer.ctx.fillStyle = saveFillColor;
		viewer.ctx.globalAlpha = 1;
	};



	return CursorView;
});