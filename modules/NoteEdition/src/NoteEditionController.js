define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/core/src/NoteManager',
	'modules/Cursor/src/CursorModel',
	'utils/NoteUtils',
	'utils/UserLog',
	'jquery',
	'pubsub',
], function(Mustache, SongModel, NoteManager, CursorModel, NoteUtils, UserLog, $, pubsub) {

	function NoteEditionController(songModel, cursor, noteSpaceMng) {
		if (!songModel || !cursor) {
			throw "NoteEditionController params are wrong";
		}
		this.songModel = songModel;
		this.cursor = cursor;
		this.noteSpaceMng = noteSpaceMng; // in tests we don't pass noteSpaceMng, it will be undefined
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	NoteEditionController.prototype.initSubscribe = function() {
		var self = this;
		/*
				$.subscribe('NoteEditionView-setPitch', function(el, decal) {
					self.setPitch(decal);
				});
				$.subscribe('NoteEditionView-addAccidental', function(el, accidental) {
					// Accidental contain as first argument the type of accidental (b,#,n) and as second argument true or false for double accidental
					// Or it may contain a string
					var acc = '';
					if (accidental.hasOwnProperty('acc')) {
						acc = accidental.acc;
					} else {
						acc = accidental;
					}
					var doubleAccidental = false;
					if (accidental.hasOwnProperty('double')) {
						doubleAccidental = accidental.double;
					}
					self.addAccidental(acc, doubleAccidental);
				});
				$.subscribe('NoteEditionView-setCurrDuration', function(el, duration) {
					self.setCurrDuration(duration);
				});
				$.subscribe('NoteEditionView-setDot', function(el) {
					self.setDot();
				});
				$.subscribe('NoteEditionView-setTie', function(el) {
					self.setTie();
				});
				$.subscribe('NoteEditionView-setTuplet', function(el) {
					self.setTuplet();
				});
				$.subscribe('NoteEditionView-setSilence', function(el) {
					self.setSilence();
				});
				$.subscribe('NoteEditionView-deleteNote', function(el) {
					self.setSilence();
				});
				$.subscribe('NoteEditionView-addNote', function(el) {
					self.addNote();
				});
				$.subscribe('NoteEditionView-copyNotes', function(el) {
					self.copyNotes();
				});
				$.subscribe('NoteEditionView-pasteNotes', function(el) {
					self.pasteNotes();
				});
		*/

		//TODO: these two functions are not verified / tested after refactoring
		$.subscribe('NoteEditionView-activeView', function(el) {
			self.changeEditMode(true);
			$.publish('ToViewer-draw', self.songModel);
		});
		$.subscribe('NoteEditionView-unactiveView', function(el) {
			self.changeEditMode(false);
		});

		// cursor view subscribe
		$.subscribe('Cursor-moveCursorByElement-notes', function(el, inc) {
			if (self.cursor.getEditable()) {
				self.moveCursorByBar(inc);
				$.publish('CanvasLayer-refresh');
			}
		});
		// All functions related with note edition go here
		$.subscribe('NoteEditionView', function(el, fn, param) {
			if (self.noteSpaceMng.isEnabled()) {
				self[fn].call(self, param);
				$.publish('ToViewer-draw', self.songModel);
			}
		});

	};
	//Private functions
	/**
	 * if a duration function applied to a tuplet note, we expand cursor to include the other tuplet notes (to avoid strange durations
	 */
	NoteEditionController.prototype._ifTupletExpandCursor = function() {
		var noteManager = this.songModel.getComponent('notes');
		var notes = noteManager.getNotes();
		var c = this.cursor.getStart();
		if (notes[c].isTuplet()) {
			c--;
			while (c >= 0 && notes[c].isTuplet() && !notes[c].isTuplet('stop')) {
				this.cursor.setPos([c, this.cursor.getEnd()]);
				c--;
			}
		}
		c = this.cursor.getEnd();
		if (notes[c].isTuplet()) {
			c++;
			while (c < notes.length && notes[c].isTuplet() && !notes[c].isTuplet('start')) {
				this.cursor.setPos([this.cursor.getStart(), c]);
				c++;
			}
		}
	};

	/**
	 * Return a boolean that indicates is the whole tuplet is selected by the cursor from a note Index
	 */
	NoteEditionController.prototype._isWholeTupletSelected = function(noteIndex) {
		if (isNaN(noteIndex)) {
			throw 'NoteEditionController - _isWholeTupletSelected - You should send a noteIndex to get a valid answer ' + noteIndex;
		}
		var notes = this.songModel.getComponent('notes').getNotes();
		var cursorStart = this.cursor.getStart();
		var cursorEnd = this.cursor.getEnd();
		if (noteIndex < cursorStart || cursorEnd < noteIndex) {
			return false;
		}
		var cursorTmp = noteIndex;
		if (!notes[cursorTmp].isTuplet('start')) {
			// If selected note is not the start, then we search for tuplet start backward in the cursor selection
			cursorTmp--;
			while (cursorTmp > cursorStart && !notes[cursorStart].isTuplet('start')) {
				cursorTmp--;
			}
			if (cursorTmp < cursorStart) {
				return false;
			}
		}
		cursorTmp = noteIndex;
		if (!notes[cursorTmp].isTuplet('stop')) {
			// If selected note is not the stop, then we search for tuplet stop forward in the cursor selection
			cursorTmp++;
			while (cursorTmp <= cursorEnd && !notes[cursorTmp].isTuplet('stop')) {
				cursorTmp++;
			}
			if (cursorEnd < cursorTmp) {
				return false;
			}
		}
		return true;
	};

	/**
	 * for duration functions we will check always if change does not exceeds a bar duration
	 * @param  {NoteManager} tmpNm
	 * @return {Boolean}
	 */
	NoteEditionController.prototype._fitsInBar = function(tmpNm) {
		var noteManager = this.songModel.getComponent('notes');
		var initIndex = this.cursor.getStart();
		var initBeat = noteManager.getNoteBeat(initIndex);
		var numBar = noteManager.getNoteBarNumber(initIndex, this.songModel);
		var barBeatDuration = this.songModel.getTimeSignatureAt(numBar).getQuarterBeats();
		var barRelativeBeat = initBeat - this.songModel.getStartBeatFromBarNumber(numBar);

		var notesNew = tmpNm.getNotes();
		var duration;
		for (var i = 0; i < notesNew.length; i++) {
			duration = notesNew[i].getDuration();
			if (barRelativeBeat < barBeatDuration && Math.round((barRelativeBeat + duration) * 100000) / 100000 > barBeatDuration) {
				return false;
			}
			barRelativeBeat += duration;
		}
		return true;
	};
	/**
	 * used usuarlly by pitch functions
	 * @return {Array} Array of NoteModel
	 */
	NoteEditionController.prototype._getSelectedNotes = function() {
		var noteManager = this.songModel.getComponent('notes');
		var selectedNotes = noteManager.getNotes(this.cursor.getStart(), this.cursor.getEnd() + 1);
		return selectedNotes;
	};

	/**
	 * Function clones selectedNotes and inserts it in a new NoteManager
	 * @return {NoteManager} return a cloned notemanager that contain as many notes as the cursor selection
	 */
	NoteEditionController.prototype._cloneSelectedNotes = function() {
		/*we run it in a temporal NoteManager, and then we check if there are duration differences to fill with silences or not*/
		var nm = this.songModel.getComponent('notes');
		var selectedNotes = nm.cloneElems(this.cursor.getStart(), this.cursor.getEnd() + 1);
		var tmpNm = new NoteManager();
		tmpNm.setNotes(selectedNotes);
		return tmpNm;
	};
	/**
	 * checks if after doing the required operation the duration of the changes is longer than what was selected or not
	 * if it is shorter it adds silences,
	 * if it is longer but the duration finishes inside the duration of a note, it deletes the note and replaces the remaining time with silence too
	 * @param  {NoteManager} noteMng   manager of the original notes
	 * @param  {NoteManager} tmpNm     manager of the selected notes after being modified (e.g. if we are adding a dot to a quarter note, tmpNm will contain that note already dotted)
	 * @param  {Integer} durBefore duration before the changes (.e.g 1 beats,  for a quarter note)
	 * @param  {Integer} durAfter  duration after the chagnes (e.g. 1.5 beats, for a dotted quarter note)
	 * @return {tmpNm}           returns tmpNm with added rests if necessary, ready for being pasted to original note manager
	 */
	NoteEditionController.prototype._checkDuration = function(noteMng, tmpNm, durBefore, durAfter) {
		function checkIfBreaksTuplet(initBeat, endBeat, nm) {
			/**
			 * means that is a 0.33333 or something like that
			 * @return {Boolean}
			 */
			function isTupletBeat(beat) {
				beat = beat * 16;
				return Math.round(beat) != beat;
			}
			var iPrevNote = nm.getNextIndexNoteByBeat(initBeat);
			var iNextNote = nm.getNextIndexNoteByBeat(endBeat);
			return isTupletBeat(nm.getNoteBeat(iPrevNote)) || isTupletBeat(nm.getNoteBeat(iNextNote));
		}
		var initBeat = noteMng.getNoteBeat(this.cursor.getStart());
		var endBeat = initBeat + durAfter;
		if (durAfter < durBefore) {
			tmpNm.fillGapWithRests(durBefore - durAfter, initBeat);
		} else if (durAfter > durBefore) {
			if (checkIfBreaksTuplet(initBeat, endBeat, noteMng)) {
				//TODO: return object
				UserLog.logAutoFade('error', "Can't break tuplet");
				return;
			}
			var endIndex = noteMng.getNextIndexNoteByBeat(endBeat);
			var beatEndNote = noteMng.getNoteBeat(endIndex);
			if (endBeat < beatEndNote) {
				tmpNm.fillGapWithRests(beatEndNote - endBeat, initBeat);
			}
			this.cursor.setPos([this.cursor.getStart(), endIndex - 1]);
		}

		return tmpNm;
	};

	/**
	 * wrapper for all duration functions
	 * @param  {Function} fn function to be called
	 */
	NoteEditionController.prototype._runDurationFn = function(fn) {

		var noteMng = this.songModel.getComponent('notes');
		var tmpNm = this._cloneSelectedNotes();
		var tmpCursorPos = this.cursor.getPos();
		var durBefore = tmpNm.getTotalDuration();

		//Here we run the actual function
		var res = fn(tmpNm);
		if (res && res.error) {
			UserLog.logAutoFade('error', res.error);
			return;
		}

		var durAfter = tmpNm.getTotalDuration();
		//check if durations fit in the bar duration
		if (!this._fitsInBar(tmpNm)) {
			UserLog.logAutoFade('error', "Duration doesn't fit the bar");
			return;
		}

		tmpNm = this._checkDuration(noteMng, tmpNm, durBefore, durAfter);
		noteMng.notesSplice(this.cursor.getPos(), tmpNm.getNotes());
		this.cursor.setPos(tmpCursorPos);
		noteMng.reviseNotes();
	};
	//Public functions:
	//
	//Pitch functions
	/**
	 * Set selected notes to a key
	 * @param {int|letter} If decal is a int, than it will be a decal between current note and wanted note in semi tons, if decal is a letter then current note is the letter
	 */
	NoteEditionController.prototype.setPitch = function(decalOrNote) {
		var selNotes = this._getSelectedNotes();
		var note;
		for (var i = 0, c = selNotes.length; i < c; i++) {
			note = selNotes[i];
			if (note.isRest) {
				note.setRest(false);
			}
			var newKey;
			if (NoteUtils.getValidPitch(decalOrNote) !== -1) {
				//find closest key
				newKey = NoteUtils.getClosestKey(note.getPitch(), decalOrNote);
				note.setNoteFromString(newKey);
			} else {
				newKey = NoteUtils.getKey(note.getPitch(), decalOrNote); // decalOrNote is 1 or -1
				note.setNoteFromString(newKey);
			}
		}
	};

	NoteEditionController.prototype.addAccidental = function(accidental) {
		var selNotes = this._getSelectedNotes();
		var note;
		if (typeof doubleAccidental !== "undefined" && doubleAccidental === true && accidental !== "n") {
			accidental += accidental;
		}
		for (var i = 0; i < selNotes.length; i++) {
			note = selNotes[i];
			if (note.isRest) continue;
			if (note.getAccidental() == accidental) {
				note.removeAccidental();
			} else {
				note.setAccidental(accidental);
			}
		}
	};

	//Duration functions
	/**
	 * setCurrDuration("4")
	 * @param {String} duration	represents the duration
	 */
	NoteEditionController.prototype.setCurrDuration = function(duration) {
		this._ifTupletExpandCursor();
		this._runDurationFn(function(tmpNm) {

			var arrDurs = {
				"1": "64",
				"2": "32",
				"3": "16",
				"4": "8",
				"5": "q",
				"6": "h",
				"7": "w",
				"8": "w" //should be double whole but not supported yet
			};
			var notes = tmpNm.getNotes();
			var newDur = arrDurs[duration];
			if (typeof newDur === "undefined") {
				throw 'NoteEditionController - setCurrDuration not accepted duration ' + duration;
			}

			for (var i = 0; i < notes.length; i++) {
				notes[i].setDuration(newDur);
			}
		});
	};

	NoteEditionController.prototype.setDot = function() {
		this._runDurationFn(function(tmpNm) {
			var notes = tmpNm.getNotes();
			var numberOfDots = 0;
			for (var i = 0, c = notes.length; i < c; i++) {
				numberOfDots = notes[i].getDot();
				if (numberOfDots >= 2) {
					numberOfDots = 0;
				} else {
					numberOfDots++;
				}
				notes[i].setDot(numberOfDots);
			}
			return notes;
		});
	};

	NoteEditionController.prototype.setTie = function() {
		var selNotes = this._getSelectedNotes();
		var note;
		if (selNotes.length == 2) {
			for (var i = 0; i < selNotes.length; i++) {
				note = selNotes[i];
				if (i === 0) {
					if (note.isTie("start"))
						note.removeTie("start");
					else
						note.setTie("start");
				} else {
					if (note.isTie("stop"))
						note.removeTie("stop");
					else
						note.setTie("stop");
				}
			}
		}
	};

	NoteEditionController.prototype.setTuplet = function() {
		var self = this;
		this._runDurationFn(function(tmpNm) {

			function validDur(notes) {
				//get total duration
				var dur = 0,
					i;
				for (i = 0; i < notes.length; i++) {
					dur += notes[i].getDuration();
				}
				//check if valid
				var initDur = 4;
				for (i = 0; i < 6; i++) {
					if (initDur == dur) return true;
					initDur /= 2;
				}
				return false;
			}

			function createTupletFromNotes(arrNotes, timeModif) {
				var firstNote = arrNotes[0],
					tmpNote,
					newDuration = (arrNotes.length == 1) ? firstNote.getDuration() / 2 : firstNote.getDuration();
				tupletsNote = [];

				for (var i = 0; i < 3; i++) {
					tmpNote = firstNote.clone();
					tmpNote.setDuration(newDuration);

					if (i === 0) tmpNote.setTuplet("start", timeModif);
					else if (i === 1) tmpNote.setTuplet("middle", timeModif);
					else tmpNote.setTuplet("stop", timeModif);

					tupletsNote.push(tmpNote);
				}
				return tupletsNote;
			}
			var selNotes = tmpNm.getNotes();
			var note;
			var timeModif = "3/2";
			if (selNotes.length > 3) {
				return {
					'error': 'You must select 3 notes or less'
				};
			}
			//check all notes have same dur
			for (var i = 0; i < selNotes.length - 1; i++) {
				if (selNotes[i].getDuration() != selNotes[i + 1].getDuration()) {
					return {
						'error': 'Notes have not then same duration'
					};
				}
			}
			if (selNotes.length < 3) {
				if (!validDur(selNotes)) {
					return {
						'error': 'You must choose to make a tuplet over simple durations (not dotted neither tuplet notes)'
					};
				}
			}
			if (selNotes.length == 1 || selNotes.length == 2) {
				var tupletsNote = createTupletFromNotes(selNotes, timeModif);
				tmpNm.setNotes(tupletsNote);
			} else if (selNotes.length == 3) {
				for (var i = 0; i < selNotes.length; i++) {
					note = selNotes[i];
					if (note.isTuplet()) {
						note.removeTuplet();
					} else {
						if (i === 0) note.setTuplet("start", timeModif);
						else if (i == selNotes.length - 1) note.setTuplet("stop", timeModif);
						else note.setTuplet("middle", timeModif);
					}
				}
			}
		});
	};
	NoteEditionController.prototype.setSilence = function() {
		//this._ifTupletExpandCursor();
		var self = this;
		var deleteNoteTupletCount = 0;
		var deleteNoteTupletToDo = 0;
		var noteToDelete = [];
		var tupletToDelete = [];
		this._runDurationFn(function(tmpNm) {
			var selNotes = tmpNm.getNotes();
			var note;
			for (var i = 0; i < selNotes.length; i++) {
				note = selNotes[i];
				if (note.isTie()) {
					note.removeTie();
				}
				if (self._isWholeTupletSelected(self.cursor.getStart() + i) && note.isTuplet()) { // get realIndex and not the cursor dependent index
					// in case it's a new tuplet
					if (note.isTuplet('start')) {
						// case we have a 3/2 tuplet, we do 3-2 = 1 so we need to remove 1 note
						deleteNoteTupletToDo = note.getTimeModification().split('/')[0] - note.getTimeModification().split('/')[1];
						deleteNoteTupletCount = 0;
					}
					tupletToDelete.push(i);
					if (deleteNoteTupletCount < deleteNoteTupletToDo) {
						// delete note we don't need
						noteToDelete.push(i);
						deleteNoteTupletCount++;
					}
				}
				if (!note.isRest) note.setRest(true);
			}
			for (var j = 0; j < tupletToDelete.length; j++) {
				selNotes[tupletToDelete[j]].removeTuplet();
			}
			for (var k = 0; k < noteToDelete.length; k++) {
				tmpNm.deleteNote(noteToDelete[k]);
			}
		});
		//self.cursor.setIndexPos(1, self.cursor.getEnd() - noteToDelete.length);
	};


	NoteEditionController.prototype.addNote = function() {
		this._runDurationFn(function(tmpNm) {
			var cloned = tmpNm.getNotes()[0].clone(false);
			tmpNm.insertNote(0, cloned);
		});

	};

	NoteEditionController.prototype.copyNotes = function() {
		this._ifTupletExpandCursor();
		var noteManager = this.songModel.getComponent('notes');
		this.buffer = noteManager.cloneElems(this.cursor.getStart(), this.cursor.getEnd() + 1);
	};


	NoteEditionController.prototype.pasteNotes = function() {
		var notesToPaste = this.buffer;
		this._runDurationFn(function(tmpNm) {
			tmpNm.setNotes(notesToPaste);
		});
	};

	NoteEditionController.prototype.moveCursorByBar = function(inc) {
		if (this.cursor.getEditable() === false) {
			return;
		}
		var noteManager = this.songModel.getComponent('notes');
		var barNum = noteManager.getNoteBarNumber(this.cursor.getPos()[0], this.songModel);

		if (barNum === 0 && inc === -1) {
			this.cursor.setPos(0);
			$.publish('ToViewer-draw', this.songModel);
			return;
		}

		var startBeat = this.songModel.getStartBeatFromBarNumber(barNum + inc);
		var indexFirstNoteInNewBar = noteManager.getNextIndexNoteByBeat(startBeat);

		this.cursor.setPos(indexFirstNoteInNewBar);
		$.publish('ToViewer-draw', this.songModel);
	};

	NoteEditionController.prototype.changeEditMode = function(isEditable) {
		this.cursor.setEditable(isEditable);
	};

	return NoteEditionController;
});