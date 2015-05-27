define([
	'modules/core/src/NoteModel',
	'modules/NoteEdition/src/NoteSpaceView',
	'modules/Cursor/src/CursorModel',
	'utils/UserLog',
	'modules/Edition/src/ElementManager',
	'jquery',
	'pubsub',
], function(NoteModel, NoteSpaceView, CursorModel, UserLog, ElementManager,$, pubsub) {

	function NoteSpaceManager(cursor, viewer) {

		if (!cursor) {
			throw "NoteSpaceManager - missing cursor";
		}
		if (!viewer) {
			throw "NoteSpaceManager - missing viewer";
		}
		this.name = 'NotesCursor';
		this.cursor = cursor;
		this.viewer = viewer;
		this.elemMng = new ElementManager();
		this.noteSpace = [];
		this.initSubscribe();
		this.enabled = true;

		this.CURSOR_HEIGHT = 80;
		this.CURSOR_MARGIN_TOP = 20;
		this.CURSOR_MARGIN_LEFT = 6;
		this.CURSOR_MARGIN_RIGHT = 9;

	}

	/**
	 * Subscribe to view events
	 */
	NoteSpaceManager.prototype.initSubscribe = function() {
		var self = this;

		$.subscribe('LSViewer-drawEnd', function(el, viewer) {
			if (!self.viewer.canvasLayer) {
				throw "NoteSpaceManager needs CanvasLayer";
			}

			//if (self.cursor.getEditable()) {
			self.noteSpace = self.createNoteSpace(self.viewer);
			self.viewer.canvasLayer.addElement(self);
			self.viewer.canvasLayer.refresh();

		});
		// $.subscribe('CanvasLayer-updateCursors',function(el,coords){
		// self.updateCursor(coords);
		// });
	};
	NoteSpaceManager.prototype.createNoteSpace = function(viewer) {
		var noteSpace = [];
		if (typeof viewer.vxfBars === "undefined") {
			return;
		}
		var area;

		for (var i = 0, c = viewer.noteViews.length; i < c; i++) {
			currentNote = viewer.noteViews[i];
			area = currentNote.getArea();
			//apply cursor margin changes
			area.x -= this.CURSOR_MARGIN_LEFT;
			area.y += this.CURSOR_MARGIN_TOP;
			area.w += this.CURSOR_MARGIN_LEFT + this.CURSOR_MARGIN_RIGHT;
			area.h = this.CURSOR_HEIGHT;
			noteSpace.push(new NoteSpaceView(area, viewer.scaler));
		}
		return noteSpace;
	};
	/**
	 * @inteface
	 * @param  {Object} coords
	 * @return {Object} e.g: {topY:44, bottomY: 23}
	 */
	NoteSpaceManager.prototype.getYs = function(coords) {
		return this.elemMng.getYs(this.noteSpace, coords);
	};
	/**
	 * @interface
	 * @param  {Object} coords 
	 */
	NoteSpaceManager.prototype.updateCursor = function(coords) {

		var notes = this.elemMng.getElemsInPath(this.noteSpace, coords);

		if (notes) {
			this.cursor.setPos(notes);
			//$.publish('ToViewer-draw',self.songModel);
		}
	};
	/**
	 * @interface
	 * @param  {Object} coords {x: xval, y: yval}}
	 * @return {Boolean}
	 */
	NoteSpaceManager.prototype.inPath = function(coords) {
		return !!this.elemMng.getElemsInPath(this.noteSpace, coords);
	};
	/**
	 * @interface
	 * @param  {CanvasContext} ctx 
	 */
	NoteSpaceManager.prototype.draw = function(ctx) {
		if (this.noteSpace.length === 0) return;
		var position = this.cursor.getPos();
		var saveFillColor = ctx.fillStyle;
		ctx.fillStyle = "#0099FF";
		ctx.globalAlpha = 0.2;
		var currentNoteSpace;
		var areas = [];

		if (position[0] !== null) {
			if (position[0] === position[1]) {
				areas.push({
					x: this.noteSpace[position[0]].position.x,
					y: this.noteSpace[position[0]].position.y,
					w: this.noteSpace[position[0]].position.w,
					h: this.noteSpace[position[0]].position.h
				});
			} else {
				var cursorDims = {
					right: this.CURSOR_MARGIN_RIGHT,
					left: this.CURSOR_MARGIN_LEFT,
					top: 0,
					height: this.CURSOR_HEIGHT
				};
				areas = this.elemMng.getElementsAreaFromCursor(this.noteSpace, position, cursorDims);
			}
			for (i = 0, c = areas.length; i < c; i++) {
				ctx.fillRect(
					areas[i].x,
					areas[i].y,
					areas[i].w,
					areas[i].h
				);
			}
			ctx.fillStyle = saveFillColor;
			ctx.globalAlpha = 1;
		}

	};

	/**
	 * @interface
	 */
	NoteSpaceManager.prototype.isEnabled = function() {
		return this.enabled;
	};

	/**
	 * @interface
	 */
	NoteSpaceManager.prototype.enable = function() {
		this.enabled = true;
	};

	/**
	 * @interface
	 */
	NoteSpaceManager.prototype.disable = function() {
		this.enabled = false;
	};
	/**
	 * @interface
	 */
	NoteSpaceManager.prototype.setCursorEditable = function(bool) {
		this.cursor.setEditable(bool);
	};

	return NoteSpaceManager;
});