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
		$.subscribe('LSViewer-mouseover', function(el, position) {
			var inPath = self.isInPath(position.x, position.y);
			if (inPath !== false) {
				myApp.viewer.el.style.cursor = 'pointer';
				//self.cursor.setPos(inPath);
				//myApp.viewer.draw(self.songModel);
			}else{
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
		var cursorHeight = 80;
		var cursorMarginTop = 20;
		var cursorMarginLeft = 4;
		var cursorMarginRight = 8;
		var xi, yi, xe, ye;
		var area;
		var scale = viewer.SCALE;
		for (var i = 0, c = viewer.vxfNotes.length; i < c; i++) {
			currentNote = viewer.vxfNotes[i];
			currentNoteStaveY = currentNote.stave.y;
			boundingBox = currentNote.getBoundingBox();
			area = {
				x: boundingBox.x - cursorMarginLeft,
				y: currentNoteStaveY + cursorMarginTop,
				xe: boundingBox.w + cursorMarginLeft + cursorMarginRight,
				ye: cursorHeight
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
	NoteSpaceManager.prototype.getNotesAreasFromCursor = function(cursor) {
		var areas = [];
		var cInit = cursor[0];
		var cEnd = cursor[1];
		if (typeof this.vxfNotes[cInit] === "undefined") {
			return areas;
		}
		var xi, yi, xe, ye;
		ye = this.LINE_HEIGHT;

		var currentNote, currentNoteStaveY, nextNoteStaveY;
		var firstNoteLine, lastNoteLine;
		firstNoteLine = this.vxfNotes[cInit];
		while (cInit <= cEnd) {
			currentNote = this.vxfNotes[cInit];
			currentNoteStaveY = currentNote.stave.y;
			if (typeof this.vxfNotes[cInit + 1] !== "undefined") {
				nextNoteStaveY = this.vxfNotes[cInit + 1].stave.y;
			}
			if (currentNoteStaveY != nextNoteStaveY || cInit == cEnd) {
				lastNoteLine = currentNote.getBoundingBox();
				xi = firstNoteLine.getBoundingBox().x;
				xe = lastNoteLine.x - xi + lastNoteLine.w;
				areas.push({
					x: xi,
					y: currentNoteStaveY,
					xe: xe,
					ye: ye
				});
				if (cInit != cEnd) {
					firstNoteLine = this.vxfNotes[cInit + 1];
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
		for (var i = position[0]; i <= position[1]; i++) {
			currentNoteSpacePosition = this.noteSpace[i].position;
			viewer.ctx.fillRect(
				currentNoteSpacePosition.x,
				currentNoteSpacePosition.y,
				currentNoteSpacePosition.xe,
				currentNoteSpacePosition.ye
			);
		}
		viewer.ctx.fillStyle = saveFillColor;
		viewer.ctx.globalAlpha = 1;
	};

	return NoteSpaceManager;
});