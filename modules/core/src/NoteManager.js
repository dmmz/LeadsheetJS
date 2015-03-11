define(['modules/core/src/NoteModel', 'utils/NoteUtils'], function(NoteModel, NoteUtils) {
	function NoteManager() {
		this.notes = [];
	}

	// Interface functions (this functions are also in ChordManagerModel)

	/**
	 * @interface
	 * @return {integer}
	 */
	NoteManager.prototype.getTotal = function() {
		return this.notes.length;
	};
	/**
	 * returns duration in number of beats
	 * @param  {Integer} pos1
	 * @param  {Integer} pos2
	 * @return {float}
	 */
	NoteManager.prototype.getTotalDuration = function(pos1, pos2) {
		var notes = this.getNotes(pos1, pos2);
		var totalDur = 0;
		notes.forEach(function(note) {
			totalDur += note.getDuration();
		});
		return roundBeat(totalDur);
	};

	NoteManager.prototype.addNote = function(note, pos) {
		if (!note instanceof NoteModel) throw "note is not an instance of Note";
		if (typeof pos === "undefined") {
			this.notes.push(note);
		} else { //check
			this.notes.splice(pos, 0, note);
		}
	};
	/**
	 * @param  {integer} by default 0
	 * @return {NoteModel}
	 */
	NoteManager.prototype.getNote = function(pos) {
		pos = pos || 0;
		return this.notes[pos];
	};

	NoteManager.prototype.deleteNote = function(pos) {
		if (typeof pos === "undefined") throw "pos undefined. Can't delete note";
		var notes = this.getNotes();
		this.notes.splice(pos, 1);
	};

	/**
	 * gets notes (by reference. To clone use cloneElems)
	 * @param  {Integer} from :  index, if not specified, 0
	 * @param  {Integer} to   :  index, first note that is not taken, e.g if to = 4, notes will be taken from 'from' to 3.
	 * @return {Array}   array of NoteModel
	 */
	NoteManager.prototype.getNotes = function(from, to) {
		return this.notes.slice(from, to);
	};

	/**
	 * [setNotes description]
	 * @param {Array} notes array of NoteModel
	 */
	NoteManager.prototype.setNotes = function(notes) {
		if (typeof notes !== "undefined") this.notes = notes;
	};


	NoteManager.prototype.insertNote = function(pos, note) {
		if (isNaN(pos) || !(note instanceof NoteModel)) {
			throw 'NoteManager - insertNote - attribute incorrect ' + pos + ' ' + note;
		}
		this.notes.splice(pos + 1, 0, note);
	};

	/**
	 * @interface
	 *
	 * returns a copy of the notes from, pos1, to pos2.
	 * @param  {Integer} pos1 if not specified, 0
	 * @param  {Integer} pos2 first note that is not taken, e.g if to = 4, notes will be taken from 'from' to 3.
	 * @return {Array}  array of cloned NoteModel
	 */
	NoteManager.prototype.cloneElems = function(pos1, pos2) {
		var newNotes = [];
		var notesToClone = this.getNotes(pos1, pos2);
		var note;
		notesToClone.forEach(function(note) {
			newNotes.push(note.clone());
		});
		return newNotes;
	};


	/**
	 * replace notes from pos1 to pos2+1, by default will always replace one note, if we want to insert notes at
	 * position pos without replacing note at 'pos' (e.g. scoreeditor.addBar() does it) we need to call it with cursor = [pos, pos -1 ]
	 * @param  {Array} cursor       [pos1,pos2]
	 * @param  {Array } notesToPaste array of NoteModel
	 */
	NoteManager.prototype.notesSplice = function(cursor, notesToPaste) {
		var part1 = this.notes.slice(0, cursor[0]);
		var part2 = this.notes.slice(cursor[1] + 1, this.notes.length); //selected notes are removed
		var copyArr = [];
		for (var i = 0, c = notesToPaste.length; i < c; i++) copyArr.push(notesToPaste[i].clone());
		this.notes = part1.concat(copyArr, part2);
	};

	/**
	 * returns the global beat of a note specified by its index (starting at 1)
	 * @param  {Integer} index of the note
	 * @return {Float}   beat
	 */
	NoteManager.prototype.getNoteBeat = function(index) {
		if (typeof index === "undefined" || isNaN(index) ||
			index >= this.notes.length || index < 0) {
			throw "NoteManager - getNoteBeat: problem with index " + index;
		}
		var noteBeat = 1, // because beats are based on 1
			i;
		for (i = 0; i < index; i++) {
			noteBeat += this.notes[i].getDuration();
		}
		return roundBeat(noteBeat);
	};

	/**
	 * @param  {NoteModel} note
	 * @return {Integer}
	 */
	NoteManager.prototype.getNoteIndex = function(note) {
		if (typeof note !== "undefined" && note instanceof NoteModel) {
			for (var i = 0; i < this.notes.length; i++) {
				if (JSON.stringify(this.notes[i].serialize(true)) === JSON.stringify(note.serialize(true))) {
					return i;
				}
			}
		}
		return undefined;
	};


	NoteManager.prototype.getNotesAtBarNumber = function(barNumber, song) {
		if (!song) {
			throw "NoteManager - getNotesAtBarNumber - incorrect song parameter";
		}

		var startBeat = 1,
			endBeat;
		/*	beats = song.getTimeSignature().getBeats();
		for (var i = 0; i < barNumber; i++) {
			startBeat += song.getTimeSignatureAt(i).getBeats();
		}*/
		startBeat = song.getStartBeatFromBarNumber(barNumber);
		endBeat = startBeat + song.getTimeSignatureAt(barNumber).getBeats();

		if (this.getTotalDuration() + 1 < endBeat) {
			console.warn("NoteManager - getNotesAtBarNumber - notes on bar " + barNumber + " do not fill the total bar duration" + (this.getTotalDuration() + 1) + ' ' + endBeat);
			//throw "NoteManager - getNotesAtBarNumber - notes on bar " + barNumber + " do not fill the total bar duration" + (this.getTotalDuration() + 1) + ' ' + endBeat;
		}
		return this.getNotes(
			this.getNextIndexNoteByBeat(startBeat),
			this.getNextIndexNoteByBeat(endBeat)
		);
	};

	NoteManager.prototype.getNoteBarNumber = function(index, song) {
		if (isNaN(index) || index < 0 || typeof song === "undefined") {
			throw "NoteManager - getNoteBarNumber - attributes are not what expected, song: " + song + ", index: " + index;
		}
		var numBar = 0,
			duration = 0;

		var barNumBeats = song.getBarNumBeats(numBar, null);
		for (var i = 0; i <= index; i++) {
			if (roundBeat(duration) == barNumBeats) {
				numBar++;
				duration = 0;
				barNumBeats = song.getBarNumBeats(numBar, barNumBeats);
			}
			duration += this.notes[i].getDuration();
		}
		return numBar;
	};

	/**
	 * @param  {integer} start
	 * @param  {integer} end
	 * @return {Array}
	 */
	NoteManager.prototype.getBeatIntervalByIndexes = function(start, end) {
		if (typeof start === "undefined" || isNaN(start) ||
			start >= this.notes.length || start < 0) {
			throw "NoteManager - getBeatIntervalByIndexes:  problem with start " + start;
		}
		if (typeof end === "undefined" || isNaN(end) ||
			end >= this.notes.length || end < 0) {
			throw "problem with end " + end;
		}

		var startBeat = this.getNoteBeat(start);
		var endBeat = this.getNoteBeat(end) + this.getNote(end).getDuration();
		endBeat = roundBeat(endBeat);
		return [startBeat, endBeat];
	};

	/**
	 * Returns the index found at the exact beat, and if not, at the
	 * closest note just after a given beat
	 * @param  {float} beat global beat (first beat starts at 1, not 0)
	 * @return {Integer} index of the note
	 */
	NoteManager.prototype.getNextIndexNoteByBeat = function(beat) {
		if (isNaN(beat) || beat < 1) {
			throw 'NoteManager - getNextIndexNoteByBeat - beat must be a positive integer ' + beat;
		}
		var curBeat = 1;
		var i = 0;
		//we round in the comparison in order to not carry the rounding in curBeat (which is cumulative inside the iteration)
		while (roundBeat(curBeat) < beat) { //to avoid problems with tuplet 
			/*if (typeof this.getNote(i) === "undefined") {
				return i - 1;
				// throw 'NoteManager - getNextIndexNoteByBeat - Not found';
			}*/
			curBeat += this.getNote(i).getDuration();
			i++;
		}
		return i;
	};


	/**
	 * Similar to previous one (getNextIndexNote()), but if
	 * exact beat is not found, it returns the closest previous note
	 * @param  {float} beat global beat (first beat starts at 1, not 0)
	 * @return {Integer} index of the note
	 */
	NoteManager.prototype.getPrevIndexNoteByBeat = function(beat) {
		if (isNaN(beat) || beat < 0) {
			throw 'NoteManager - getPrevIndexNoteByBeat - beat must be a positive integer ' + beat;
		}
		var curBeat = 1;
		var i = 0;
		//round just like in getNtextIndexNote
		while (roundBeat(curBeat) < beat) {
			curBeat += this.getNote(i).getDuration();
			i++;
		}
		return i - 1;
	};

	/**
	 * @param  {Integer} startBeat
	 * @param  {Integer} endBeat
	 * @return {Array}           indexes e.g. [1,2]
	 */

	NoteManager.prototype.getIndexesStartingBetweenBeatInterval = function(startBeat, endBeat) {
		if (isNaN(startBeat) || startBeat < 0) {
			startBeat = 1;
		}
		if (isNaN(endBeat)) {
			throw 'NoteManager - getIndexesByBeatInterval - endBeat must be a positive integer ' + endBeat;
		}
		var index1 = this.getNextIndexNoteByBeat(startBeat);
		var index2 = this.getPrevIndexNoteByBeat(endBeat);
		return [index1, index2];
	};

	/**
	 * adds silences at the end of array of notes so that they fill the gapDuration
	 * @param  {integer} gapDuration
	 * @param  {integer} initBeat
	 */
	NoteManager.prototype.fillGapWithRests = function(gapDuration, initBeat) {
		if (isNaN(gapDuration)) {
			return;
		}
		if (isNaN(initBeat) || initBeat < 0) {
			initBeat = 1;
		}
		gapDuration = Math.round(gapDuration * 1000000) / 1000000;
		var newNote;
		var silenceDurs = NoteUtils.durationToNotes(gapDuration, initBeat);
		var self = this;
		silenceDurs.forEach(function(dur) {
			if (typeof dur !== "undefined") {
				newNote = new NoteModel(dur + 'r');
				self.addNote(newNote);
			}
		});
	};

	/**
	 * this function is called after deleting a notes or copy and pasting notes, to check if there is a malformed tuplet or a malformed tie
	 * if it does, it deletes the tie or the tuplet
	 * @return {[type]} [description]
	 */
	NoteManager.prototype.reviseNotes = function(from, to) {

		function getRemoveSet(input, i) {
			var min = i;
			var max = i;
			while (min > 0 && input[min - 1] != "no") {
				min--;
			}
			while (max + 1 < input.length && input[max + 1] != "no") {
				max++;
			}
			return {
				min: min,
				max: max
			};
		}

		/**
		 * This function parses input controling that all transitions are valid,
		 * if it finds a problem, removes the property that causes the error
		 *
		 * @param  {Array of NoteModel} notes          notes to modify
		 * @param  {Object} graph          tranistion graph represents valid transitions
		 * @param  {Array}  input          array of states, taken from notes
		 * @param  {[type]} removeFunction function to remove property
		 */
		function parser(notes, graph, input, removeFunction) {
			var prevState, currState;
			var isTie = [];
			var states = Object.keys(graph);
			var iToStartRemoving;
			var intervalsToRemove = [];
			for (var i = 0; i < input.length; i++) {
				prevState = (i < 1) ? "no" : input[i - 1];
				currState = (i == input.length) ? "no" : input[i];

				if ($.inArray(prevState, states) == -1) {
					throw "value " + prevState + "(position " + i + ") not specified on transitions graph";
				}
				if ($.inArray(currState, graph[prevState]) == -1) {

					iToStartRemove = (currState == "no") ? i - 1 : i;
					intervalsToRemove.push(getRemoveSet(input, iToStartRemove));
				}
			}

			var max, min;
			for (var i in intervalsToRemove) {
				max = intervalsToRemove[i].max;
				min = intervalsToRemove[i].min;

				for (var j = min; j <= max; j++) {
					NoteModel.prototype[removeFunction].call(notes[j], notes[j].tie);
				}
			}

		}

		function checkTuplets(notes) {
			var note;
			var states = [];
			var state;
			for (var i = 0; i < notes.length; i++) {
				note = notes[i];
				state = note.getTuplet() || "no";
				states.push(state);
			}
			parser(notes, {
					"no": ["no", "start"],
					"start": ["middle"],
					"middle": ["stop"],
					"stop": ["start", "no"]
				}, states,
				"removeTuplet"
			);
		}

		function checkTies(notes) {
			var note;
			var states = [];
			var state;
			for (var i = 0; i < notes.length; i++) {
				note = notes[i];
				state = note.getTie() || "no";
				states.push(state);
			}
			parser(notes, {
					"no": ["no", "start"],
					"start": ["stop", "stop_start"],
					"stop_start": ["stop", "stop_start"],
					"stop": ["start", "no"]
				}, states,
				"removeTie"
			);

		}
		checkTuplets(this.notes);
		checkTies(this.notes);
	};


	/**
	 * private function for rounding beats
	 * we round to avoid problems with triplet as 12.9999999 is less than 13 and that would not work
	 * @return {[type]} [description]
	 */
	function roundBeat(beat) {
		return Math.round(beat * 1000000) / 1000000;
	}

	// NoteManager.prototype.incrOffset = function(offset, dur) {
	// 	offset += dur;
	// 	var roundOffset = Math.round(offset);
	// 	if (Math.abs(roundOffset - offset) < 0.01) offset = roundOffset; //0.01 to round only for 0.99999
	// 	return offset;
	// };
	//NoteManager.prototype.toString = function() {
	//	this.getNotes().forEach(function(note) {
	//		console.log(note.toString());
	//	});
	//};

	return NoteManager;
});