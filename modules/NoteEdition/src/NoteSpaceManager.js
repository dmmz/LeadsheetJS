define([
	'modules/core/src/NoteModel',
	'modules/NoteEdition/src/NoteSpaceView',
	'modules/Cursor/src/CursorModel',
	'utils/UserLog',
	'modules/Edition/src/ElementManager',
	'pubsub',
], function(NoteModel, NoteSpaceView, CursorModel, UserLog, ElementManager, pubsub) {
	//TODO: remove songModel ???
	function NoteSpaceManager(songModel, cursor, viewer) {

		if (!songModel) {
			throw "NoteSpaceManager - missing songModel";
		}
		if (!cursor) {
			throw "NoteSpaceManager - missing cursor";
		}
		if (!viewer) {
			throw "NoteSpaceManager - missing viewer";
		}
		this.name = 'NotesCursor';
		this.songModel = songModel;
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
		// $.subscribe('CanvasLayer-mousemove', function(el, position) {

		// 	if (self.isInPath(position) !== false) {
		// 		self.viewer.el.style.cursor = 'pointer';
		// 	} else {
		// 		self.viewer.el.style.cursor = 'default';
		// 	}
		// });

		$.subscribe('LSViewer-drawEnd', function(el, viewer) {
			if (!self.viewer.canvasLayer){
				throw "NoteSpaceManager needs CanvasLayer";
			}
			
			//if (self.cursor.getEditable()) {
			self.noteSpace = self.createNoteSpace(self.viewer);
			self.viewer.canvasLayer.addElement(self); //addElement refreshes canvasLayer
			
		});
		// $.subscribe('CanvasLayer-updateCursors',function(el,coords){
		// 	self.updateCursor(coords);
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

	NoteSpaceManager.prototype.getYs = function(coords) {
		return this.elemMng.getYs(this.noteSpace, coords);
	};

	NoteSpaceManager.prototype.updateCursor = function(coords) {
		
		var notes = this.elemMng.getElemsInPath(this.noteSpace, coords);

		if (notes) {
			this.cursor.setPos(notes);
			//$.publish('ToViewer-draw',self.songModel);
		}
	};
	NoteSpaceManager.prototype.updateNote = function(noteString, noteModel, noteSpace) {
		console.warn("function updateNote");
		if (typeof noteModel === "undefined" && typeof noteSpace !== "undefined") {
			noteModel = new NoteModel({
				'beat': noteSpace.beatNumber,
				'barNumber': noteSpace.barNumber,
			});
			this.songModel.getComponent('notes').addnote(noteModel);
		}
		noteModel.setnoteFromString(noteString);
	};

	//CANVASLAYER ELEMENT METHOD
	NoteSpaceManager.prototype.draw = function(ctx) {
		if (this.noteSpace.length == 0) return;
		var position = this.cursor.getPos();
		var saveFillColor = ctx.fillStyle;
		ctx.fillStyle = "#0099FF";
		ctx.globalAlpha = 0.2;
		var currentNoteSpace;
		var areas = [];

		if (position[0] !== null){
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
	NoteSpaceManager.prototype.isEnabled = function() {
		return this.enabled;
	};
	NoteSpaceManager.prototype.enable = function() {
		this.enabled = true;
	};
	NoteSpaceManager.prototype.disable = function() {
		this.enabled = false;
	};

	return NoteSpaceManager;
});