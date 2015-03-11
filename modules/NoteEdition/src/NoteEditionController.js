define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/core/src/NoteManager',
	'modules/Cursor/src/CursorModel',
	'utils/NoteUtils',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, NoteManager, CursorModel, NoteUtils, UserLog, pubsub) {

	function NoteEditionController(songModel, cursor, view) {
		this.songModel = songModel || new SongModel();
		this.cursor = cursor || new CursorModel();
		this.view = view;
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	NoteEditionController.prototype.initSubscribe = function() {
		var self = this;
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
			self.deleteNote();
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
		$.subscribe('NoteEditionView-activeView', function(el) {
			self.changeEditMode(true);
			myApp.viewer.draw(self.songModel);
		});
		$.subscribe('NoteEditionView-unactiveView', function(el) {
			self.changeEditMode(false);
		});
		// cursor view subscribe
		$.subscribe('CursorView-moveCursorByElementnotes', function(el, inc) {
			self.moveCursorByBar(inc);
		});

	};

	/**
	 * Set selected notes to a key
	 * @param {int|letter} If decal is a int, than it will be a decal between current note and wanted note in semi tons, if decal is a letter then current note is the letter
	 */
	NoteEditionController.prototype.setPitch = function(decalOrNote) {
		var selNotes = this.getSelectedNotes();
		var note;
		for (var i = 0, c = selNotes.length; i < c; i++) {
			note = selNotes[i];
			if (note.isRest) {
				note.setRest(false);
			}
			if (NoteUtils.getValidPitch(decalOrNote) !== -1) {
				//find closest key
				newKey = NoteUtils.getClosestKey(note.getPitch(), decalOrNote);
				note.setNoteFromString(newKey);
			} else {
				newKey = NoteUtils.getKey(note.getPitch(), decalOrNote); // decalOrNote is 1 or -1
				note.setNoteFromString(newKey);
			}
		}
		myApp.viewer.draw(this.songModel);
	};



	NoteEditionController.prototype.addAccidental = function(accidental, doubleAccidental) {
		var selNotes = this.getSelectedNotes();
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
		myApp.viewer.draw(this.songModel);
	};

	/**
	 * setCurrDuration("4")
	 * @param {String} duration	represents the duration
	 */
	NoteEditionController.prototype.setCurrDuration = function(duration) {
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
		var selNotes = this.getSelectedNotes();
		var newDur = arrDurs[duration];
		if (typeof newDur === "undefined") {
			throw 'NoteEditionController - setCurrDuration not accepted duration ' + duration;
		}
		var durBefore = 0,
			durAfter = 0;
		for (var i = 0; i < selNotes.length; i++) {
			durBefore += selNotes[i].getDuration();
			selNotes[i].setDuration(newDur);
			durAfter += selNotes[i].getDuration();
		}
		this.checkDuration(durBefore, durAfter);
		myApp.viewer.draw(this.songModel);
	};

	NoteEditionController.prototype.setDot = function() {
		var selNotes = this.getSelectedNotes();
		var numberOfDots = 0;
		var durBefore = 0,
			durAfter = 0;
		for (var i = 0, c = selNotes.length; i < c; i++) {
			durBefore += selNotes[i].getDuration();
			numberOfDots = selNotes[i].getDot();
			if (numberOfDots >= 2) {
				numberOfDots = 0;
			} else {
				numberOfDots++;
			}
			selNotes[i].setDot(numberOfDots);
			durAfter += selNotes[i].getDuration();
		}
		this.checkDuration(durBefore, durAfter);
		myApp.viewer.draw(this.songModel);
	};

	NoteEditionController.prototype.setTie = function() {
		var selNotes = this.getSelectedNotes();
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
		myApp.viewer.draw(this.songModel);
	};


	NoteEditionController.prototype.setTuplet = function() {
		function getDuration(notes) {
			var dur = 0;
			for (var i = 0; i < notes.length; i++) {
				dur += notes[i].getDuration();
			}
			return dur;
		}

		function validDur(dur) {
			initDur = 4;
			for (var i = 0; i < 6; i++) {
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
		var selNotes = this.getSelectedNotes();
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
					'error': 'Notes have not same duration'
				};
			}
		}
		if (selNotes.length < 3) {
			if (!validDur(getDuration(selNotes))) {
				return {
					'error': 'You must choose to make a tuplet over simple durations'
				};
			}
		}
		if (selNotes.length == 1 || selNotes.length == 2) {
			var tupletsNote = createTupletFromNotes(selNotes, timeModif);
			this.pasteNotes(tupletsNote);
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
		myApp.viewer.draw(this.songModel);
	};



	NoteEditionController.prototype.setSilence = function() {
		var selNotes = this.getSelectedNotes();
		var note;
		for (var i = 0; i < selNotes.length; i++) {
			note = selNotes[i];
			if (note.tie === "stop" || note.tie === "start") {
				console.warn("Can't convert to silence a tied note");
				UserLog.logAutoFade('warn', "Can't convert to silence a tied note");
				continue;
			}
			if (!note.isRest) note.setRest(true);
		}
		myApp.viewer.draw(this.songModel);
	};


	NoteEditionController.prototype.deleteNote = function() {
		var noteManager = this.songModel.getComponent('notes');
		var position = this.cursor.getPos();
		var durBefore = 0;
		for (var cInit = position[0], cEnd = position[1]; cInit <= cEnd; cInit++) {
			durBefore += noteManager.getNote(cInit).getDuration();
			noteManager.deleteNote(cInit);
		}
		this.checkDuration(durBefore, 0);
		var numNotes = noteManager.getTotal();
		this.cursor.revisePos(numNotes);
		myApp.viewer.draw(this.songModel);
	};

	NoteEditionController.prototype.addNote = function() {
		var noteManager = this.songModel.getComponent('notes');
		var pos = this.cursor.getEnd();
		var noteToClone = noteManager.getNotes(pos, pos + 1)[0];
		var cloned = noteToClone.clone(false);
		noteManager.insertNote(pos, cloned);
		this.checkDuration(0, noteToClone.getDuration());
		// this.cursor.setPos(pos + 1);
		myApp.viewer.draw(this.songModel);
	};


	NoteEditionController.prototype.copyNotes = function() {
		var noteManager = this.songModel.getComponent('notes');
		this.buffer = noteManager.cloneElems(this.cursor.getStart(), this.cursor.getEnd() + 1);
		myApp.viewer.draw(this.songModel);
	};

	NoteEditionController.prototype.pasteNotes = function(notesToPaste) {
		notesToPaste = notesToPaste || this.buffer;
		var tmpNm = new NoteManager();
		tmpNm.setNotes(notesToPaste);
		tmpNm.reviseNotes();
		notesToPaste = tmpNm.getNotes();
		var noteManager = this.songModel.getComponent('notes');
		//this.checkDuration(0, noteManager.getTotalDuration());
		noteManager.notesSplice(this.cursor.getPos(), notesToPaste);
		myApp.viewer.draw(this.songModel);
	};

	NoteEditionController.prototype.moveCursorByBar = function(inc) {
		if (this.cursor.getEditable() === false) {
			return;
		}
		var noteManager = this.songModel.getComponent('notes');
		var barNum = noteManager.getNoteBarNumber(this.cursor.getPos()[0], this.songModel);

		if (barNum === 0 && inc === -1) {
			this.cursor.setPos(0);
			myApp.viewer.draw(this.songModel);
			return;
		}
		var notesInNewBar = noteManager.getNotesAtBarNumber(barNum + inc, this.songModel);

		if (notesInNewBar.length === 0) {
			// case it's last bar
			notesInNewBar = noteManager.getNotesAtBarNumber(barNum, this.songModel);
		}
		var indexFirstNoteInNewBar = noteManager.getNoteIndex(notesInNewBar[0]);

		this.cursor.setPos(indexFirstNoteInNewBar);
		myApp.viewer.draw(this.songModel);
	};

	NoteEditionController.prototype.getSelectedNotes = function() {
		var noteManager = this.songModel.getComponent('notes');
		var selectedNotes = noteManager.getNotes(this.cursor.getStart(), this.cursor.getEnd() + 1);
		return selectedNotes;
	};

	NoteEditionController.prototype.checkDuration = function(durBefore, durAfter) {
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

		var nm = this.songModel.getComponent('notes');
		var initBeat = nm.getNoteBeat(this.cursor.getStart());
		var endBeat = initBeat + durAfter;

		if (durAfter < durBefore) {
			nm.fillGapWithRests(durBefore - durAfter, initBeat);
		} else if (durAfter > durBefore) {
			if (checkIfBreaksTuplet(initBeat, endBeat, nm)) {
				UserLog.logAutoFade('error', "Can't break tuplet");
				return;
			}
			var endIndex = nm.getNextIndexNoteByBeat(endBeat);
			var beatEndNote = nm.getNoteBeat(endIndex);

			if (endBeat < beatEndNote) {
				nm.fillGapWithRests(beatEndNote - endBeat, initBeat);
			}
			this.cursor.setPos([this.cursor.getStart(), endIndex - 1]);
		}
		//nm.notesSplice(this.cursor.getPos(), tmpNm.getNotes());
		nm.reviseNotes();
	};

	NoteEditionController.prototype.changeEditMode = function(isEditable) {
		this.cursor.setEditable(isEditable);
	};

	return NoteEditionController;
});