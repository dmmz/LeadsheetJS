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

		this.CURSORHEIGHT = 80;
		this.CURSORMARGINTOP = 20;
		this.CURSORMARGINLEFT = 6;
		this.CURSORMARGINRIGHT = 9;
	}

	/**
	 * Subscribe to view events
	 */
	NoteSpaceManager.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('LSViewer-click', function(el, position) {
			var inPath = self.isInPath(position.x, position.y);
			if (inPath !== false) {
				self.cursor.setPos(inPath);
				myApp.viewer.draw(self.songModel);
			}
		});
		$.subscribe('LSViewer-mousemove', function(el, position) {
			var inPath = self.isInPath(position.x, position.y);
			if (inPath !== false) {
				myApp.viewer.el.style.cursor = 'pointer';
				//self.cursor.setPos(inPath);
				//myApp.viewer.draw(self.songModel);
			} else {
				myApp.viewer.el.style.cursor = 'default';
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

	/**
	 * Function return several areas to indicate which notes are selected, usefull for cursor or selection
	 * @param  {[Integer, Integer] } Array with initial position and end position
	 * @return {Array of Objects}, Object in this form: {area.x, area.y, area.xe, area.ye}
	 */
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
				x: boundingBox.x - this.CURSORMARGINLEFT,
				y: currentNoteStaveY + this.CURSORMARGINTOP,
				xe: boundingBox.w + this.CURSORMARGINLEFT + this.CURSORMARGINRIGHT,
				ye: this.CURSORHEIGHT
			};
			noteSpace.push(new NoteSpaceView(viewer, area));
		}
		return noteSpace;
	};


	/**
	 * Function return several areas to indicate which notes are selected, usefull for cursor or selection
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
				xi = firstNoteLine.getBoundingBox().x - this.CURSORMARGINLEFT;
				xe = lastNoteLine.x - xi + lastNoteLine.w + this.CURSORMARGINRIGHT;
				areas.push({
					x: xi,
					y: currentNoteStaveY + this.CURSORMARGINTOP,
					xe: xe,
					ye: this.CURSORHEIGHT
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
		var position = this.cursor.getPos();
		var saveFillColor = viewer.ctx.fillStyle;
		viewer.ctx.fillStyle = "#0099FF";
		viewer.ctx.globalAlpha = 0.2;
		var currentNoteSpace;
		var areas = [];
		if (position[0] === position[1]) {
			areas.push({
				x: this.noteSpace[position[0]].position.x,
				y: this.noteSpace[position[0]].position.y,
				xe: this.noteSpace[position[0]].position.xe,
				ye: this.noteSpace[position[0]].position.ye
			});
		} else {
			areas = this.getNotesAreasFromCursor(viewer, position);
		}
		for (i = 0, c = areas.length; i < c; i++) {
			viewer.ctx.fillRect(
				areas[i].x,
				areas[i].y,
				areas[i].xe,
				areas[i].ye
			);
		}
		viewer.ctx.fillStyle = saveFillColor;
		viewer.ctx.globalAlpha = 1;
	};

	return NoteSpaceManager;
});