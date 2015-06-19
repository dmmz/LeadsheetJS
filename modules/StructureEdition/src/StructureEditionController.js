define([
	'jquery',
	'mustache',
	'modules/Cursor/src/CursorModel',
	'modules/core/src/SongModel',
	'modules/core/src/SectionModel',
	'modules/core/src/NoteManager',
	'modules/core/src/NoteModel',
	'modules/core/src/SongBarsIterator',
	'modules/core/src/TimeSignatureModel',
	'utils/UserLog',
	'pubsub',
], function($, Mustache, CursorModel, SongModel, SectionModel, NoteManager, NoteModel, SongBarsIterator, TimeSignatureModel, UserLog, pubsub) {

	function StructureEditionController(songModel, cursor, view, structEditionModel) {
		this.songModel = songModel || new SongModel();
		this.cursor = cursor || new CursorModel();
		this.initSubscribe();
		this.structEditionModel = structEditionModel;
	}

	/**
	 * Subscribe to view events
	 */
	StructureEditionController.prototype.initSubscribe = function() {
		var self = this;
		var fn;
		// All functions related with note edition go here
		$.subscribe('StructureEditionView', function(el, fn, param) {
			//if (self.noteSpaceMng.isEnabled()) {
			self[fn].call(self, param);
			$.publish('ToViewer-draw', self.songModel);
			//}
		});

	};


	StructureEditionController.prototype.addSection = function() {
		/*var selBars = this._getSelectedBars();
		if (selBars.length !== 0) {
			return;
		}*/

		// TODO add section after current section position
		var numberOfBarsToCreate = 2;
		var barManager = this.songModel.getComponent('bars');

		// clone last bar
		var indexLastBar = barManager.getTotal() - 1;
		var newBar = barManager.getBar(indexLastBar).clone();

		// now we add bar to this section and fill them with silence
		var noteManager = this.songModel.getComponent('notes');
		var indexLastNote = noteManager.getTotal() - 1;
		var initBeat = noteManager.getNoteBeat(indexLastNote);
		var beatDuration = this.songModel.getTimeSignatureAt(indexLastBar).getQuarterBeats();

		for (var i = 0; i < numberOfBarsToCreate; i++) {
			barManager.addBar(newBar);
			noteManager.fillGapWithRests(beatDuration, initBeat);
			initBeat += beatDuration;
		}
		var section = new SectionModel({
			'numberOfBars': numberOfBarsToCreate
		});
		this.songModel.addSection(section);
	};

	StructureEditionController.prototype.removeSection = function() {
		if (this.songModel.getSections().length === 1) {
			UserLog.logAutoFade('error', "You can't delete last section");
			return;
		}
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		var sectionNumber = this.songModel.getSectionNumberFromBarNumber(selBars[0]);

		var startBar = this.songModel.getStartBarNumberFromSectionNumber(sectionNumber);
		var numberOfBars = this.songModel.getSection(sectionNumber).getNumberOfBars();

		var barManager = this.songModel.getComponent('bars');
		var noteManager = this.songModel.getComponent('notes');
		//var notes;
		for (var i = 0; i < numberOfBars; i++) {
			//notes = noteManager.getNotesAtBarNumber(startBar, this.songModel);
			//for (var j = notes.length - 1; j >= 0; j--) {
			//	noteManager.deleteNote(noteManager.getNoteIndex(notes[j]));
			//}
			barManager.removeBar(startBar); // each time we remove index move so we don't need to sum startBar with i

		}
		// check if cursor not outside
		var indexLastNote = noteManager.getTotal() - 1;
		if (this.cursor.getEnd() > indexLastNote) {
			this.cursor.setPos(indexLastNote);
		}
		this.songModel.removeSection(sectionNumber);
	};

	StructureEditionController.prototype.setSectionName = function(name) {
		if (typeof name === "undefined") {
			return;
		}
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		var sectionNumber = this.songModel.getSectionNumberFromBarNumber(selBars[0]);
		this.songModel.getSection(sectionNumber).setName(name);
	};

	// Carefull, if a section is played 2 times, repeatTimes = 1
	StructureEditionController.prototype.setRepeatTimes = function(repeatTimes) {
		if (typeof repeatTimes === "undefined") {
			return;
		}
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		var sectionNumber = this.songModel.getSectionNumberFromBarNumber(selBars[0]);
		this.songModel.getSection(sectionNumber).setRepeatTimes(repeatTimes);
	};

	StructureEditionController.prototype.addBar = function() {
		var selBars = this._getSelectedBars();
		var numBar = 0;
		if (selBars.length !== 0) {
			numBar = selBars[0];
		}

		var nm = this.songModel.getComponent('notes');
		//get the duration of the bar, and create a new bar with silences
		var beatDuration = this.songModel.getTimeSignatureAt(numBar).getQuarterBeats();
		var newBarNm = new NoteManager(); //Create new Bar NoteManager
		//if is first bar we add a note, otherwise there are inconsistencies with duration of a bar
		var startBeat = 0;
		if (numBar === 0) {
			newBarNm.addNote(new NoteModel("E/4-q"));
			beatDuration = beatDuration - 1;
			startBeat = 1;
		}
		//insert those silences
		newBarNm.fillGapWithRests(beatDuration, startBeat);

		//get numBeat from first note of current bar
		var numBeat = this.songModel.getStartBeatFromBarNumber(numBar);
		// get the index of that note
		var index = nm.getNextIndexNoteByBeat(numBeat);
		nm.notesSplice([index, index - 1], newBarNm.getNotes());

		//add bar to barManager
		var barManager = this.songModel.getComponent('bars');
		var newBar = barManager.getBar(numBar).clone();
		barManager.addBar(newBar);

		//increment the number of bars of current section
		var section = this.songModel.getSection(this.songModel.getSectionNumberFromBarNumber(numBar));
		section.setNumberOfBars(section.getNumberOfBars() + 1);

		// decal chords
		this.songModel.getComponent('chords').incrementChordsBarNumberFromBarNumber(1, numBar);
	};

	StructureEditionController.prototype.removeBar = function() {
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
		var section;
		for (var i = selBars.length - 1; i > 0; i--) {
			sectionNumber = this.songModel.getSectionNumberFromBarNumber(selBars[i]);
			section = this.songModel.getSection(sectionNumber);
			sectionNumberOfBars = section.getNumberOfBars();
			if (sectionNumberOfBars === 1) {
				if (this.songModel.getSections().length === 1) {
					UserLog.logAutoFade('warn', "Can't delete the last bar of the last section.");
				} else {
					this.removeSection(sectionNumber);
				}
			} else {
				// adjust section number of bars
				section.setNumberOfBars(sectionNumberOfBars - 1);

				// remove notes in bar
				beatDuration = this.songModel.getTimeSignatureAt(selBars[i]).getQuarterBeats() - 1; // I am not sure why we remove 1 here
				numBeat = this.songModel.getStartBeatFromBarNumber(selBars[i]);
				index = nm.getNextIndexNoteByBeat(numBeat);
				index2 = nm.getNextIndexNoteByBeat(numBeat + beatDuration);
				nm.notesSplice([index, index2], []);

				// remove chords in bar
				cm.removeChordsByBarNumber(selBars[i]);
				// adjust all chords bar number
				cm.incrementChordsBarNumberFromBarNumber(-1, selBars[i]);

				bm.removeBar(selBars[i]);
			}
		}
		this.cursor.setPos(index - 1);
		/*console.log(this.cursor.getPos());
		console.log(nm.getNotes());*/

	};
	/**
	 * @param {String} timeSignature should be always a valid timeSignature
	 */
	StructureEditionController.prototype.setTimeSignature = function(timeSignature) {
		/**
		 * modifies selBars end index, if there is a time signature change, selection is reduced until the bar before the time change,
		 * this behaviour is copied from Sibelius
		 * @return {Boolean} tells if we actually reduced selection or not, later we set Time Signature change to the previous only if we did not reduce. 
		 */
		function reduceSelectionIfChanges(){
			//if there are timeSig changes in selection we just take until change
			var barsIt = new SongBarsIterator(song);
			var timeSigChangesInSelection = false,
				iBar,
				prevTimeSignature;
			barsIt.setBarIndex(selBars[0] + 1); //we check if there is a timeSig change in the middle (not in first bar) 
			while (barsIt.getBarIndex() <= selBars[1])
			{
				iBar = barsIt.getBarIndex();
				
				if (barsIt.doesTimeSignatureChange()){
					timeSigChangesInSelection = true;
					selBars[1] = barsIt.getBarIndex() - 1;
					break;
				}
				barsIt.next();
			}
			return timeSigChangesInSelection;
		}
		/**
		 * @param  {Array} selBars       indexes of bars selected
		 * @param  {Array} selectedNotes notes selected
		 * @param  {TimeSignaureModel} newTimeSig    new time signature
		 * @return {Array}               notes adapted to new time signature
		 */
		function getAdaptedNotes (selBars, selectedNotes, newTimeSig) {
			var tmpNm = new NoteManager();
			tmpNm.setNotes(selectedNotes);
			var numBars = selBars[1] + 1 - selBars[0];
			return tmpNm.getNotesAdaptedToTimeSig(newTimeSig, numBars);
		}

		//actually starts here
		//
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}

		var song = this.songModel,
			barMng = song.getComponent("bars"),
			noteMng = song.getComponent("notes"),
			newTimeSig = new TimeSignatureModel(timeSignature);
		
		//selBars[1] is modified if there are time signature changes
		var timeSigChangesInSelection = reduceSelectionIfChanges();
		
		//get notes between bars
		var startBeat = song.getStartBeatFromBarNumber(selBars[0]);
		var endBeat = (barMng.getTotal() - 1 === selBars[1]) ? null : song.getStartBeatFromBarNumber(selBars[1] + 1);
		
		//get selected notes and adapt them to new time signature
		var indexes = noteMng.getIndexesStartingBetweenBeatInterval(startBeat, endBeat);
		var selectedNotes = noteMng.cloneElems(indexes[0], indexes[1]);
		var adaptedNotes = getAdaptedNotes(selBars, selectedNotes, newTimeSig);
		
		//change time signature
		prevTimeSignature = song.getTimeSignatureAt(selBars[0]);
		barMng.getBar(selBars[0]).setTimeSignatureChange(timeSignature);

		//we set previous time signature in the bar just after the selection, only if there are not changes
		if (barMng.getTotal() - 1 > selBars[1] && !timeSigChangesInSelection && !barMng.getBar(selBars[1] + 1).getTimeSignatureChange()){
			barMng.getBar(selBars[1] + 1).setTimeSignatureChange(prevTimeSignature.toString());
		}
		
		//we set end index to -1 because notesSplice indexes are inclusive (so if we want to paste notes over indexes [0,5] we don't have to send 0,6 like in cloneElems). These differences among the code are confusing. TODO: refactor 
		indexes[1]--; 
		//we overwrite adapted notes in general note manager
		noteMng.notesSplice(indexes,adaptedNotes);
		
	};

	StructureEditionController.prototype._checkDuration = function(durBefore, durAfter) {
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

	StructureEditionController.prototype.tonality = function(tonality) {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		for (var i = 0, c = selBars.length; i < c; i++) {
			this.songModel.getComponent("bars").getBar(selBars[i]).setTonality(tonality);
		}
		$.publish('ToViewer-draw', this.songModel);
	};

	StructureEditionController.prototype.ending = function(ending) {
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
		$.publish('ToViewer-draw', this.songModel);
	};

	StructureEditionController.prototype.style = function(style) {
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
		$.publish('ToViewer-draw', this.songModel);
	};

	StructureEditionController.prototype.label = function(label) {
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
		$.publish('ToViewer-draw', this.songModel);
	};

	StructureEditionController.prototype.subLabel = function(sublabel) {
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
		$.publish('ToViewer-draw', this.songModel);
	};

	StructureEditionController.prototype._getSelectedBars = function() {
		var selectedBars = [];
		selectedBars[0] = this.songModel.getComponent('notes').getNoteBarNumber(this.cursor.getStart(), this.songModel);
		selectedBars[1] = this.songModel.getComponent('notes').getNoteBarNumber(this.cursor.getEnd(), this.songModel);
		return selectedBars;
	};

	StructureEditionController.prototype.unfold = function(force) {
		var unfold = true;
		if (typeof force === "undefined" || force === false) {
			unfold = !this.structEditionModel.unfolded;
		}
		if (unfold) {
			this.oldSong = this.songModel;
			var newSongModel = this.songModel.unfold();
			this.songModel = newSongModel;
			this.cursor.setListElements(this.songModel.getComponent('notes'));
			$.publish('ToViewer-draw', this.songModel);
		} else {
			this.cursor.setListElements(this.songModel.getComponent('notes'));
			$.publish('ToViewer-draw', this.oldSong);
		}
		this.structEditionModel.toggleUnfolded();

	};

	return StructureEditionController;
});