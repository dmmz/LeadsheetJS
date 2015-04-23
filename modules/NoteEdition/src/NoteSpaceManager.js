define([
	'modules/core/src/SongModel',
	'modules/core/src/NoteModel',
	'modules/NoteEdition/src/NoteSpaceView',
	'modules/Cursor/src/CursorModel',
	'utils/UserLog',
	'pubsub',
], function(SongModel, NoteModel, NoteSpaceView, CursorModel, UserLog, pubsub) {

	function NoteSpaceManager(songModel, cursor) {
		this.songModel = songModel || new SongModel();
		this.cursor = cursor || new CursorModel();
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
		$.subscribe('LSViewer-click', function(el, position) {
			var inPath = self.isInPath(position.x, position.y);
			if (inPath !== false) {
				$.publish('ToAllCursor-setEditable', false);
				self.cursor.setEditable(true);
				self.cursor.setPos(inPath);
				$.publish('ToViewer-draw', self.songModel);
			}
		});
		$.subscribe('LSViewer-mousemove', function(el, position) {
			var inPath = self.isInPath(position.x, position.y);
			if (inPath !== false) {
				if (typeof myApp !== 'undefined'){	//TODO: refactor, get rid of 'myApp'
					myApp.viewer.el.style.cursor = 'pointer';	
				}
				
				//self.cursor.setPos(inPath);
				//$.publish('ToViewer-draw', self.songModel);
			} else {
				if (typeof myApp !== 'undefined'){
					myApp.viewer.el.style.cursor = 'default';	
				}
				
			}
		});
		$.subscribe('LSViewer-drawEnd', function(el, viewer) {
			if (self.cursor.getEditable()) {
				self.refresh(viewer);
			}
		});
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

	NoteSpaceManager.prototype.refresh = function(viewer) {
		this.noteSpace = this.createNoteSpace(viewer);
		this.draw(viewer);
	};

	NoteSpaceManager.prototype.isInPath = function(x, y) {
		for (var i = 0, c = this.noteSpace.length; i < c; i++) {
			if (typeof this.noteSpace[i] !== "undefined") {
				if (this.noteSpace[i].isInPath(x, y)) {
					return i;
				}
			}
		}
		return false;
	};


	NoteSpaceManager.prototype.createNoteSpace = function(viewer) {
		var noteSpace = [];
		if (typeof viewer.vxfBars === "undefined") {
			return;
		}
		var xi, yi, xe, ye;
		var area;
		var scale = viewer.SCALE;
		for (var i = 0, c = viewer.vxfNotes.length; i < c; i++) {
			currentNote = viewer.vxfNotes[i];
			currentNoteStaveY = currentNote.stave.y;
			boundingBox = currentNote.getBoundingBox();
			area = {
				x: boundingBox.x - this.CURSOR_MARGIN_LEFT,
				y: currentNoteStaveY + this.CURSOR_MARGIN_TOP,
				xe: boundingBox.w + this.CURSOR_MARGIN_LEFT + this.CURSOR_MARGIN_RIGHT,
				ye: this.CURSOR_HEIGHT
			};
			noteSpace.push(new NoteSpaceView(area,viewer));
		}
		return noteSpace;
	};


	/**
	 * Returns several areas to indicate which notes are selected, usefull for cursor or selection
	 * @param  {[Integer, Integer] } Array with initial position and end position
	 * @return {Array of Objects}, Object in this form: {area.x, area.y, area.xe, area.ye}
	 */
	NoteSpaceManager.prototype.getNotesAreasFromCursor = function(viewer, cursor) {
		var areas = [];
		var cInit = cursor[0];
		var cEnd = cursor[1];
		if (typeof viewer.vxfNotes[cInit] === "undefined") {
			return areas;
		}
		var xi, yi, xe;

		var currentNote, currentNoteStaveY, nextNoteStaveY;
		var firstNoteLine, lastNoteLine;
		firstNoteLine = viewer.vxfNotes[cInit];
		while (cInit <= cEnd) {
			currentNote = viewer.vxfNotes[cInit];
			currentNoteStaveY = currentNote.stave.y;
			if (typeof viewer.vxfNotes[cInit + 1] !== "undefined") {
				nextNoteStaveY = viewer.vxfNotes[cInit + 1].stave.y;
			}
			if (currentNoteStaveY != nextNoteStaveY || cInit == cEnd) {
				lastNoteLine = currentNote.getBoundingBox();
				xi = firstNoteLine.getBoundingBox().x - this.CURSOR_MARGIN_LEFT;
				xe = lastNoteLine.x - xi + lastNoteLine.w + this.CURSOR_MARGIN_RIGHT;
				areas.push({
					x: xi,
					y: currentNoteStaveY + this.CURSOR_MARGIN_TOP,
					xe: xe,
					ye: this.CURSOR_HEIGHT
				});
				if (cInit != cEnd) {
					firstNoteLine = viewer.vxfNotes[cInit + 1];
				}
			}

			cInit++;
		}
		return areas;
	};

	NoteSpaceManager.prototype.draw = function(viewer) {
		var self = this;
		var ctx = viewer.ctx ;
		viewer.drawElem(function(ctx){
		
			var position = self.cursor.getPos();
			var saveFillColor = ctx.fillStyle;
			ctx.fillStyle = "#0099FF";
			ctx.globalAlpha = 0.2;
			var currentNoteSpace;
			var areas = [];
			if (position[0] === position[1]) {
				areas.push({
					x: self.noteSpace[position[0]].position.x,
					y: self.noteSpace[position[0]].position.y,
					xe: self.noteSpace[position[0]].position.xe,
					ye: self.noteSpace[position[0]].position.ye
				});
			} else {
				areas = self.getNotesAreasFromCursor(viewer, position);
			}
			for (i = 0, c = areas.length; i < c; i++) {
				ctx.fillRect(
					areas[i].x,
					areas[i].y,
					areas[i].xe,
					areas[i].ye
				);
			}
			ctx.fillStyle = saveFillColor;
			ctx.globalAlpha = 1;
		});
	};

	return NoteSpaceManager;
});