define([
	'mustache',
	'modules/Cursor/src/CursorModel',
	'modules/core/src/SongModel',
	'modules/core/src/BarModel',
	'modules/core/src/NoteManager',
	'modules/core/src/NoteModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, CursorModel, SongModel, BarModel, NoteManager, NoteModel, UserLog, pubsub) {

	function BarEditionController(songModel, cursor, view) {
		this.songModel = songModel || new SongModel();
		this.cursor = cursor || new CursorModel();
		this.view = view;
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	BarEditionController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('BarEditionView-addBar', function(el) {
			self.addBar();
		});
		$.subscribe('BarEditionView-removeBar', function(el) {
			self.removeBar();
		});
		$.subscribe('BarEditionView-timeSignature', function(el, timeSignature) {
			self.timeSignature(timeSignature);
		});
		$.subscribe('BarEditionView-tonality', function(el, tonality) {
			self.tonality(tonality);
		});
		$.subscribe('BarEditionView-ending', function(el, ending) {
			self.ending(ending);
		});
		$.subscribe('BarEditionView-style', function(el, style) {
			self.style(style);
		});
		$.subscribe('BarEditionView-label', function(el, label) {
			self.label(label);
		});
		$.subscribe('BarEditionView-sublabel', function(el, sublabel) {
			self.subLabel(sublabel);
		});
		$.subscribe('BarEditionView-activeView', function(el) {
			self.changeEditMode(true);
			myApp.viewer.draw(self.songModel);
		});
		$.subscribe('BarEditionView-unactiveView', function(el) {
			self.changeEditMode(false);
		});
	};


	BarEditionController.prototype.addBar = function() {
		var selBars = this._getSelectedBars();
		var numBar = 0;
		if (selBars.length !== 0) {
			numBar = selBars[0];
		}

		//get numBeat from first note of current bar
		var numBeat = this.songModel.getStartBeatFromBarNumber(numBar) + 1;

		// get the index of that note
		var nm = this.songModel.getComponent('notes');
		var index = nm.getNextIndexNoteByBeat(numBeat);

		//get the duration of the bar, and create a new bar with silences
		var beatDuration = this.songModel.getTimeSignatureAt(numBar).getQuarterBeats();
		var newBarNm = new NoteManager(); //Create new Bar NoteManager
		//if is first bar we add a note, otherwise there are inconsistencies with duration of a bar
		if (numBar === 0) {
			newBarNm.addNote(new NoteModel("E/4-q"));
			beatDuration = beatDuration - 1;
		}
		//insert those silences
		newBarNm.fillGapWithRests(beatDuration);

		//add bar to barManager
		var barManager = this.songModel.getComponent('bars');
		var newBar = barManager.getBar(numBar).clone();
		barManager.addBar(newBar);
		var s = new NoteModel("E/4-q");
		/*console.log(JSON.stringify(s));
		s.setRest(true);
		console.log(JSON.stringify(s));
		console.log(JSON.stringify(new NoteModel("qr")));*/

		// TODO bug to create rest note
		//newBarNm.getNotes();
		//nm.notesSplice([index, index - 1], newBarNm);
		nm.notesSplice([index, index - 1], [new NoteModel("E/4-q"), new NoteModel("E/4-q"), new NoteModel("E/4-q"), new NoteModel("E/4-q")]);

		//increment the number of bars of current section
		var section = this.songModel.getSection(this.songModel.getSectionNumberFromBarNumber(numBar));
		section.setNumberOfBars(section.getNumberOfBars() + 1);

		this.songModel.getComponent('chords').incrementChordsBarNumberFromBarNumber(1, numBar);

		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype.removeBar = function() {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		var bm = this.songModel.getComponent('bars');
		var sectionNumber;
		var sectionNumberOfBars;
		var nm = this.songModel.getComponent('notes');
		var cm = this.songModel.getComponent('chords');
		var beatDuration, numBeat, index, index2;
		for (var i = selBars.length - 1; i > 0; i--) {
			sectionNumber = this.songModel.getSectionNumberFromBarNumber(selBars[i]);
			section = this.songModel.getSection(sectionNumber);
			sectionNumberOfBars = section.getNumberOfBars();
			if (sectionNumberOfBars === 1) {
				UserLog.logAutoFade('warn', "Can't delete the last bar of section.");
			} else {
				// adjust section number of bars
				section.setNumberOfBars(sectionNumberOfBars - 1);

				// remove notes in bar
				beatDuration = this.songModel.getTimeSignatureAt(selBars[i]).getQuarterBeats();
				numBeat = this.songModel.getStartBeatFromBarNumber(selBars[i]) + 1;
				index = nm.getNextIndexNoteByBeat(numBeat);
				index2 = nm.getPrevIndexNoteByBeat(numBeat + beatDuration);
				nm.notesSplice([index, index2], []);

				// remove chords in bar
				cm.removeChordsByBarNumber(selBars[i]);
				// adjust all chords bar number
				cm.incrementChordsBarNumberFromBarNumber(-1, selBars[i]);

				bm.removeBar(selBars[i]);
			}
		}
		this.cursor.setPos(index - 1);


		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype.timeSignature = function(timeSignature) {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		var durationBefore = this.songModel.getSongTotalBeats();
		for (var i = 0, c = selBars.length; i < c; i++) {
			if (timeSignature === "none") {
				timeSignature = undefined;
			}
			this.songModel.getComponent("bars").getBar(selBars[i]).setTimeSignature(timeSignature);
		}
		var durationAfter = this.songModel.getSongTotalBeats();
		this._checkDuration(durationBefore, durationAfter);
		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype._checkDuration = function(durBefore, durAfter) {
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
		var initBeat = 1;
		var endBeat = durAfter + 1;

		if (durBefore < durAfter) {
			nm.fillGapWithRests(durAfter - durBefore, initBeat);
		} else if (durBefore > durAfter) {
			if (checkIfBreaksTuplet(initBeat, durAfter, nm)) {
				UserLog.logAutoFade('error', "Can't break tuplet");
				return;
			}
			var endIndex = nm.getNextIndexNoteByBeat(endBeat);
			var beatEndNote = nm.getNoteBeat(endIndex);

			if (endBeat < beatEndNote) {
				nm.fillGapWithRests(beatEndNote - endBeat, initBeat);
			}
		}
		//nm.notesSplice(this.cursor.getPos(), tmpNm.getNotes());
		nm.reviseNotes();
	};

	BarEditionController.prototype.tonality = function(tonality) {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		for (var i = 0, c = selBars.length; i < c; i++) {
			this.songModel.getComponent("bars").getBar(selBars[i]).setTonality(tonality);
		}
		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype.ending = function(ending) {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		for (var i = 0, c = selBars.length; i < c; i++) {
			if (ending === "none") {
				ending = undefined;
			}
			this.songModel.getComponent("bars").getBar(selBars[i]).setEnding(ending);
		}
		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype.style = function(style) {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		for (var i = 0, c = selBars.length; i < c; i++) {
			if (style === "none") {
				style = undefined;
			}
			this.songModel.getComponent("bars").getBar(selBars[i]).setStyle(style);
		}
		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype.label = function(label) {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		for (var i = 0, c = selBars.length; i < c; i++) {
			if (label === "none") {
				label = '';
			}
			this.songModel.getComponent("bars").getBar(selBars[i]).setLabel(label);
		}
		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype.subLabel = function(sublabel) {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		for (var i = 0, c = selBars.length; i < c; i++) {
			if (sublabel === "none") {
				sublabel = undefined;
			}
			this.songModel.getComponent("bars").getBar(selBars[i]).setSublabel(sublabel);
		}
		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype._getSelectedBars = function() {
		var selectedBars = [];
		selectedBars[0] = this.songModel.getComponent('notes').getNoteBarNumber(this.cursor.getStart(), this.songModel);
		selectedBars[1] = this.songModel.getComponent('notes').getNoteBarNumber(this.cursor.getEnd(), this.songModel);
		return selectedBars;
	};

	BarEditionController.prototype.changeEditMode = function(isEditable) {
		this.cursor.setEditable(isEditable);
	};

	return BarEditionController;
});