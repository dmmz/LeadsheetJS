define([
	'modules/core/src/SongModel',
	'modules/core/src/NoteModel',
	'modules/NoteEdition/src/NoteSpaceView',
	'modules/Cursor/src/CursorModel',
	'utils/UserLog',
	'utils/EditionUtils',
	'pubsub',
], function(SongModel, NoteModel, NoteSpaceView, CursorModel, UserLog, EditionUtils, pubsub) {

	function NoteSpaceManager(songModel, cursor, viewer) {

		if (!viewer || typeof viewer === 'string') {
			throw "NoteSpaceManager - missing viewer ";
		}
		this.songModel = songModel || new SongModel();
		this.cursor = cursor || new CursorModel();
		this.viewer = viewer;
		this.noteSpace = [];
		this.initSubscribe();

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
		$.subscribe('CanvasLayer-mousemove', function(el, position) {

			if (self.isInPath(position) !== false) {
				self.viewer.el.style.cursor = 'pointer';
			} else {
				self.viewer.el.style.cursor = 'default';
			}
		});

		$.subscribe('LSViewer-drawEnd', function(el, viewer) {
			
			self.viewer.canvasLayer.addElement('scoreCursor', self);
			if (self.cursor.getEditable()) {
				self.noteSpace = self.createNoteSpace(self.viewer);
				
				//self.refresh(true);
			}
		});
		$.subscribe('CanvasLayer-updateCursors',function(el,coords){
			self.updateCursor(coords);
		});
	};
	NoteSpaceManager.prototype.getYs = function(coords) {
		var notes = this.getNotesInPath(coords);
		if (notes){
			return {
				topY: this.viewer.noteViews[notes[0]].getArea().y,
				bottomY: this.viewer.noteViews[notes[1]].getArea().y
			};
		}
		else{
			return false;
		}
	};

	NoteSpaceManager.prototype.updateCursor = function(coords) {
		
		var notes = this.getNotesInPath(coords);

		if (notes) {
			this.cursor.setEditable(true);
			this.cursor.setPos(notes);
			//$.publish('ToViewer-draw',self.songModel);
		}
	};
	NoteSpaceManager.prototype.updateNote = function(noteString, noteModel, noteSpace) {
		if (typeof noteModel === "undefined" && typeof noteSpace !== "undefined") {
			noteModel = new NoteModel({
				'beat': noteSpace.beatNumber,
				'barNumber': noteSpace.barNumber,
			});
			this.songModel.getComponent('notes').addnote(noteModel);
		}
		noteModel.setnoteFromString(noteString);
	};
	/**
	 *
	 * @param  {Object}  area can be in two forms :
	 *                        {x: 10, y: 10, xe: 20, ye: 20} / xe and ye are absolute positions (not relative to x and y)
	 *                        {x: 10, y:10}
	 * @return {Boolean}
	 */
	NoteSpaceManager.prototype.isInPath = function(area) {

		for (var i in this.noteSpace) {
			if (typeof this.noteSpace[i] !== "undefined") {
				if (this.noteSpace[i].isInPath(area)) {
					return i;
				}
			}
		}
		return false;
	};
	NoteSpaceManager.prototype.getNotesInPath = function(coords) {
		var note,
			min = null,
			max = null;
		for (var i in this.noteSpace) {
			if (this.noteSpace[i].isInPath(coords)) {
				if (min == null) {
					min = Number(i);
				}
				if (max == null || max < i) {
					max = Number(i);
				}
			}
		}
		return (min === null && max === null) ? false : [min, max];
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
					top: this.CURSOR_MARGIN_TOP,
					height: this.CURSOR_HEIGHT
				};
				areas = EditionUtils.getElementsAreaFromCursor(this.viewer.noteViews, position, cursorDims);
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

	return NoteSpaceManager;
});