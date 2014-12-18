define(['modules/core/src/NoteModel'], function(NoteModel) {
	function NoteManager() {
		this.notes = [];
	}
	//Interface functions (this functions are also in ChordManagerModel  )

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
			throw "problem with index " + index;
		}
		var noteBeat = 1, // because beats are based on 1
			i;
		for (i = 0; i < index; i++) {
			noteBeat += this.notes[i].getDuration();
		}
		return roundBeat(noteBeat);
	};

	/**
	 * @param  {integer} start
	 * @param  {integer} end
	 * @return {Array}
	 */
	NoteManager.prototype.getBeatIntervalByIndexes = function(start, end) {
		if (typeof start === "undefined" || isNaN(start) ||
			start >= this.notes.length || start < 0) {
			throw "problem with start " + start;
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
		if (!beat || isNaN(beat) || beat < 1) {
			throw "beat not valid: " + beat;
		}
		var curBeat = 1;
		var i = 0;
		//we round in the comparison in order to not carry the rounding in curBeat (which is cumulative inside the iteration)
		while (roundBeat(curBeat) < beat) { //to avoid problems with tuplet 
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
		if (typeof beat === "undefined" || isNaN(beat) || beat > this.getTotalDuration() + 1) { // +1 because we start at beat 1
			throw "beat not valid: " + beat;
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
		var index1 = this.getNextIndexNoteByBeat(startBeat);
		var index2 = this.getPrevIndexNoteByBeat(endBeat);
		return [index1, index2];
	};

	/**
	 * @param  {NoteModel} note
	 * @return {Integer}
	 */

	NoteManager.prototype.getNoteIndex = function(note) {
		if (typeof note !== "undefined" && note instanceof NoteModel) {
			for (var i = 0; i < this.notes.length; i++) {
				if (JSON.stringify(this.notes[i].serialize(true, true)) === JSON.stringify(note.serialize(true, true))) {
					return i;
				}
			}
		}
		return undefined;
	};
	/**
	 * tells if global beat is the same as the one from the previous note 
	 * @param  {Number}  indexNote global index of the note to compare to previous one
	 * @return {Boolean}           
	 */
	NoteManager.prototype.isSameBeatAsPreviousNote = function(indexNote) {

		if (indexNote === 0)	return false;
		var beat = this.getNoteBeat(indexNote);
		var beatAnt = this.getNoteBeat(indexNote - 1);
		return Math.floor(beat) == Math.floor(beatAnt);

	};
	NoteManager.prototype.getNotesAtBarNumber = function(barNumber, song) {
		if (!song) {
			throw "getNotesAtBarNumber: incorrect song parameter";
		}
		
		

		function getBarBeats(numBar, defaultBeats) {
			var timeSig = song.getBar(i).timeSignature;
			return (timeSig) ? timeSig.getBeats() : defaultBeats;
		}
		var startBeat = 1,
			endBeat,
			beats = song.timeSignature.getBeats();
		for (var i = 0; i < barNumber; i++) {
			startBeat += getBarBeats(i, beats);
		}
		endBeat = startBeat + getBarBeats(i, beats);
		
		if (this.getTotalDuration()+1 < endBeat){
			throw "notes on bar "+barNumber+" do not fill the total bar duration";
		}
		return this.getNotes(
			this.getNextIndexNoteByBeat(startBeat),
			this.getNextIndexNoteByBeat(endBeat)
		);
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
