define(['modules/core/NoteModel'], function(NoteModel) {
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
		return totalDur;
	};

	NoteManager.prototype.insertNote = function(note, pos) {
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
		for (var i = 0; i < notesToPaste.length; i++) copyArr.push(notesToPaste[i].clone());
		this.notes = part1.concat(copyArr, part2);
	};

	/**
	 * @param  {integer} start
	 * @param  {integer} end
	 * @return {Array}
	 */
	NoteManager.prototype.getBeatIntervalByIndexes = function(start, end) {
		var startBeat = this.getNoteBeat(start);
		var endBeat = this.getNoteBeat(end) + this.getNote(end).getDuration();
		return [startBeat, endBeat];
	};

	/**
	 * returns the global beat of a note specified by its index (starting at 1)
	 * @param  {Integer} index of the note
	 * @return {Float}   beat
	 */
	NoteManager.prototype.getNoteBeat = function(index) {
		if (typeof index === "undefined" || isNaN(index)) return -1;
		var noteBeat = 0;
		for (var i = 0; i < index; i++) {
			noteBeat += this.notes[i].getDuration();
		}
		return Math.round(noteBeat * 1000000) / 1000000 + 1; // +1 because beats are based on 1
	};


	/**
	 * Returns the index found at the exact beat, and if not, at the
	 * closest note just after a given beat
	 * @param  {float} beat global beat (first beat starts at 1, not 0)
	 * @return {Integer} index of the note
	 */
	NoteManager.prototype.getNextIndexNote = function(beat) {
		var curBeat = 1;
		var i = 0;
		//we round to avoid problems with triplet as 12.9999999 is less than 13 and that would not work
		//we round in the comparison in order to not carry the rounding in curBeat (which is cumulative inside the iteration)
		while (Math.round(curBeat * 100000) / 100000 < beat) { //to avoid problems with tuplet 
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
	NoteManager.prototype.getPrevIndexNote = function(beat) {
		var curBeat = 1;
		var i = 0;
		//round just like in getNtextIndexNote
		while (Math.round(curBeat * 1000000) / 1000000 < beat) {

			curBeat += this.getNote(i).getDuration();
			i++;
		}
		return i - 1;
	};

	NoteManager.prototype.getIndexesByBeatInterval = function(startBeat, endBeat) {
		var index1 = this.getNextIndexNote(startBeat);
		var index2 = this.getPrevIndexNote(endBeat);
		return [index1, index2];
	};
	// NoteManager.prototype.getNoteIndex = function( note ) {
	// 	if(typeof note !== "undefined" && note instanceof NoteModel){
	// 		for (var i = 0; i < this.notes.length; i++) {
	// 			if(JSON.stringify(this.notes[i].toNoteStruct(true, true)) === JSON.stringify(note.toNoteStruct(true, true))) {
	// 				return i;
	// 			}
	// 		}
	// 	}
	// 	return undefined;
	// };

	// NoteManager.prototype.toString = function() {
	// 	this.getNotes().forEach(function(note) {
	// 		console.log(note.toString());
	// 	});
	// };

	return NoteManager;
});



/**
 * @interface
 *
 * @param  {integer} from index of first note to get
 * @param  {integer} to   index of last note to get
 * @return {Array}      array of NoteModel
 */
/*NoteManager.prototype.getElemsToMusicCSLJSON = function(from, to) {
	var notes = [];
	this.getNotes(from, to + 1).forEach(function(note) {
		notes.push(note.exportToMusicCSLJSON());
	});
	return notes;
};*/

/**
 * @interface
 *
 * returns a copy of the notes from, pos1, to pos2.
 * @param  {Integer} pos1
 * @param  {Integer} pos2
 * @param  {String} type : if "model" returns notes as copies of NoteMode Prototype, if "struct" it returns it in 'struct' fromat
 * @return {[type]}      [description]
 */
/*NoteManager.prototype.clone = function(pos1, pos2, type) {
	type = type || "model";
	var newNotes = [];
	var note;
	var notesToClone = this.getNotes(pos1, pos2);

	notesToClone.forEach(function(note) {
		var cNote;
		if (type == "struct")
			cNote = note.toNoteStruct();
		else
			cNote = note.clone();

		newNotes.push(cNote);
	});

	return newNotes;
};*/