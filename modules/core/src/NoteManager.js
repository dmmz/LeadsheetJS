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
	 * Adds notes in a given position (special case of noteSplice)
	 * @param {Array of NoteModel} notes
	 * @param {Integer} position
	 */
	NoteManager.prototype.addNotes = function(notes, position) {
		if (position === undefined) {
			position = this.notes.length;
		}
		this.notesSplice([position, position - 1], notes);
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
	 *
	 * @return {Array} array of pitches of all the notes. e.g.  ["Db/4", "E/4", "F/4", "A#/4", "C/5", "B/4"]
	 */
	NoteManager.prototype.getNotesAsString = function() {
		var arrPitches = [];
		this.notes.forEach(function(note) {
			arrPitches.push(note.toString());
		});
		return arrPitches;
	};


	/**
	 * FUNCTION DOES NOT WORK AS EXPECTED
	 * @param  {NoteModel} note
	 * @return {Integer}
	 */
	NoteManager.prototype.getNoteIndex = function(note) {
		if (typeof note !== "undefined" && note instanceof NoteModel) {
			console.warn('getNoteIndex does not work as expected');
			for (var i = 0; i < this.notes.length; i++) {
				if (JSON.stringify(this.notes[i].serialize(true)) === JSON.stringify(note.serialize(true))) {
					return i;
				}
			}
		}
		return undefined;
	};
	NoteManager.prototype.getIndexesBetweenBarNumbers = function(barNum1, barNum2, song) {
		if (!song){
			throw "NoteManager - getNotesBetweenBarNumbers - missing parameter song";
		}
		var barMng = song.getComponent('bars');
		var startBeat = song.getStartBeatFromBarNumber(barNum1);
		var endBeat = (barMng.getTotal() - 1 === barNum2) ? null : song.getStartBeatFromBarNumber(barNum2 + 1);
		return this.getIndexesStartingBetweenBeatInterval(startBeat, endBeat);
	};
	NoteManager.prototype.getNotesBetweenBarNumbers = function(barNum1, barNum2, song) {
		var indexes = this.getIndexesBetweenBarNumbers(barNum1, barNum2, song);
		return this.getNotes(indexes[0],indexes[1]);
	};

	NoteManager.prototype.getNotesAtBarNumber = function(barNumber, song) {
		if (!song) {
			throw "NoteManager - getNotesAtBarNumber - incorrect song parameter";
		}

		var startBeat = 1,
			endBeat;
		startBeat = song.getStartBeatFromBarNumber(barNumber);
		endBeat = startBeat + song.getTimeSignatureAt(barNumber).getQuarterBeats();
		
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
	 * abstraction of code used by both getNextIndexNoteByBeat and getPrevIndexNoteByBeat
	 * @param  {} curBeat [description]
	 * @param  {[type]} beat    [description]
	 * @return {[type]}         [description]
	 */
	NoteManager.prototype._getIndexAndCurBeat = function(beat) {
		var i = 0,
			curNote,
			curBeat = 1;
		//we round in the comparison in order to not carry the rounding in curBeat (which is cumulative inside the iteration)
		while (roundBeat(curBeat) < beat) { //to avoid problems with tuplet 
			curNote = this.getNote(i);
			if (curNote === undefined) {
				// throw 'NoteManager - _getIndexAndCurBeat - Note not found (possibly beat is greater than last note beat)';
				return {
					index: undefined,
					curBeat: curBeat
				};
			}
			curBeat += curNote.getDuration();
			i++;
		}
		return {
			index: i,
			curBeat: curBeat
		};
	};
	/**
	 * Returns the index of the note found at the exact beat, and if not, at the
	 * closest note just after a given beat
	 * @param  {float} beat global beat (first beat starts at 1, not 0)
	 * @return {Integer} index of the note
	 * TODO: optimisation: accept object with cached index and beat to start from, useful when function is called in loops (iterator)
	 */
	NoteManager.prototype.getNextIndexNoteByBeat = function(beat) {
		if (isNaN(beat) || beat < 1) {
			throw 'NoteManager - getNextIndexNoteByBeat - beat must be a positive float greater than 1 ' + beat;
		}
		return this._getIndexAndCurBeat(beat).index;
	};


	/**
	 * Similar to previous one (getNextIndexNote()), but if
	 * exact beat is not found, it returns the closest previous note
	 * @param  {float} beat global beat (first beat starts at 1, not 0)
	 * @param  {ifExactExclude} if note with index X starts at beat, we will not include it, we'll return index X-1
	 *
	 * @return {Integer} index of the note
	 */
	NoteManager.prototype.getPrevIndexNoteByBeat = function(beat, ifExactExclude) {
		if (isNaN(beat) || beat < 0) {
			throw 'NoteManager - getPrevIndexNoteByBeat - beat must be a positive float ' + beat;
		}
		var r = this._getIndexAndCurBeat(beat);
		var index;
		if (r.curBeat === beat) {
			index = ifExactExclude ? r.index - 1 : r.index;
		} else {
			index = r.index - 1;
		}
		return index;
	};

	/**
	 * gets index of note who's start is between startBeat and endBeat, if endBeat exceed total duration, it returns last index end index
	 * @param  {Integer} startBeat
	 * @param  {Integer} endBeat
	 * @param {Boolean} ifExactExlude, default is false. 
	 *                                 ex: to get all notes of bar 1 we should do getIndexesStartingBetweenBeatInterval(1,5,true) or getIndexesStartingBetweenBeatInterval(1,4.99)
	 *                                 normally we want to not exclude because function getNotes(start,end) already excludes 'end' index and gets notes until end - 1
	 * @return {Array}           indexes e.g. [1,2]
	 */

	NoteManager.prototype.getIndexesStartingBetweenBeatInterval = function(startBeat, endBeat, ifExactExclude) {
		
		if (isNaN(startBeat) || startBeat < 0) {
			startBeat = 1;
		}
		if (isNaN(endBeat)) {
			throw 'NoteManager - getIndexesStartingBetweenBeatInterval - endBeat must be a positive integer ' + endBeat;
		}
		var index1 = this.getNextIndexNoteByBeat(startBeat);
		var index2;
		if (endBeat > this.getTotalDuration()  || endBeat == null){ // important == to be true if null or undefined
			index2 = ifExactExclude ? this.getTotal() - 1 : this.getTotal();
		}else{
			index2 = this.getPrevIndexNoteByBeat(endBeat, ifExactExclude); //ifExactExclude is true, that means that we wont return note starting exactly at endBeat
		}
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
		if (isNaN(initBeat) || initBeat <= 0) {
			initBeat = 1;
		}
		gapDuration = Math.round(gapDuration * 1000000) / 1000000;
		var newNote;
		var silenceDurs = NoteUtils.durationToNotes(gapDuration, initBeat);
		var self = this;
		silenceDurs.forEach(function(dur) {
			if (typeof dur !== "undefined") {
				newNote = new NoteModel(dur + 'r');
				var pos = self.getNextIndexNoteByBeat(initBeat);
				if (typeof pos === "undefined") {
					self.addNote(newNote);
				} else {
					self.insertNote(pos, newNote);
				}
			}
		});
	};

	/**
	 * if there are ties that with different pitches, we remove the tie
	 */
	NoteManager.prototype.reviseTiesPitch = function() {
		var notes = this.notes;
		var note, notes2;
		for (var i = 0; i < notes.length - 1; i++) {
			note = notes[i];
			note2 = notes[i + 1];
			if (note.isTie('start') && note2.isTie('stop') && note.getPitch() != note2.getPitch()) {
				note.removeTie(note.getTie());
				note2.removeTie(note2.getTie());
			}
		}
	};

	/**
	 * this function is called after deleting a notes or copy and pasting notes, to check if there is a malformed tuplet or a malformed tie
	 * if it does, it deletes the tie or the tuplet
	 * @return {[type]} [description]
	 */
	NoteManager.prototype.reviseNotes = function() {

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
					var iToStartRemove = (currState == "no") ? i - 1 : i;
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