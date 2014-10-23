define(['modules/core/src/SongModel', 'modules/core/src/ChordModel'], function(SongModel, ChordModel) {
	function ChordManager(chords) {
		this.chords = chords ? chords : []; // array of chordModel
	};

	/**
	 * Interface functions (this functions are also in NoteManagerModel  )
	 * @interface
	 */
	ChordManager.prototype.getTotal = function() {
		return this.chords.length;
	};

	ChordManager.prototype.isEmpty = function() {
		return this.chords.length == 0;
	};

	ChordManager.prototype.getChords = function(from, to) {
		return this.chords.slice(from, to);
	};

	ChordManager.prototype.setAllChords = function(chords) {
		if (typeof chord === "undefined" || !(chord instanceof ChordModel)) {
			throw 'Chord must be a ChordModel';
		}
		this.chords = chords;
	}

	ChordManager.prototype.getChord = function(index) {
		if (typeof index !== "undefined" && !isNaN(index)) {
			if (this.chords[index]) {
				return this.chords[index];
			}
		}
		return undefined;
	}
	ChordManager.prototype.getChordIndex = function(chord) {
		if (typeof chord === "undefined" || !(chord instanceof ChordModel)) {
			throw 'Chord must be a ChordModel';
		}
		for (var i = 0, c = this.chords.length; i < c; i++) {
			if (JSON.stringify(this.getChord(i)) === JSON.stringify(chord)) {
				return i;
			}
		}
		return undefined;
	}

	/**
	 * Set a new chord to a specific index, if chords[index] already have a chord it will replace it
	 * @param {ChordModel} chord
	 * @param {int} index
	 */
	ChordManager.prototype.setChord = function(chord, index) {
		if (typeof chord === "undefined" || !(chord instanceof ChordModel) || typeof index === "undefined" || isNaN(index) || index < 0) {
			throw 'Wrong Parameters';
		}
		this.chords[index] = chord;
	}

	/**
	 * Add a new chord at the end of chords array, if chord is not set, it create a new instance of chordModel
	 * @param {ChordModel} chord
	 */
	ChordManager.prototype.addChord = function(chord) {
		if (typeof chord !== "undefined" && chord instanceof ChordModel) {
			this.chords.push(chord);
		} else {
			this.chords.push(new ChordModel());
		}
	}

	/**
	 * Insert a  new chord to a specific index, all chords after index will have their index incremented
	 * @param {ChordModel} chord
	 * @param {int} index
	 */
	ChordManager.prototype.insertChord = function(index, chord) {
		if (typeof index !== "undefined" && isNaN(index)) {
			throw 'Index must be a int in insert chord';
		}
		if (typeof chord === "undefined" || !(chord instanceof ChordModel)) {
			var chord = new ChordModel();
		}
		this.chords.splice(index, 0, chord);
	}

	/**
	 * Search and remove a chord from the array, chordModel is destroyed
	 * @param  {ChordModel} chord
	 */
	ChordManager.prototype.removeChord = function(chord) {
		if (typeof chord !== "undefined" && !(chord instanceof ChordModel)) {
			throw 'Chord must be a ChordModel';
		}
		var chordIndex = this.getChordIndex(chord);
		this.removeChordByIndex(chordIndex);
	};

	/**
	 * Remove a chord from the array based on it's index, chordModel is destroyed
	 * @param  {int} index
	 */
	ChordManager.prototype.removeChordByIndex = function(index) {
		if (typeof index === "undefined" || isNaN(index) || index < 0) {
			throw 'Index must be a int in removeChordByIndex';
		}
		if (this.chords[index]) {
			var deletedChords = this.chords.splice(index, 1);
			delete deletedChords;
		}
	};

	/**
	 * Return an array of chords that are in a bar define by barNumber argument
	 * @param  {int} barNumber
	 */
	ChordManager.prototype.getChordsByBarNumber = function(barNumber) {
		var chordsByBarNumber = [];
		if (typeof barNumber !== "undefined" && !isNaN(barNumber) && barNumber >= 0) {
			var currentChord;
			for (var i = 0, c = this.chords.length; i < c; i++) {
				currentChord = this.chords[i];
				if (currentChord.getBarNumber() === barNumber) {
					chordsByBarNumber.push(currentChord);
				}
			}
		}
		return chordsByBarNumber;
	};

	/**
	 * @interface
	 *
	 * returns a copy of the chords from, pos1, to pos2.
	 * @param  {Integer} pos1
	 * @param  {Integer} pos2
	 * @return {[type]}      [description]
	 */
	ChordManager.prototype.cloneElems = function(pos1, pos2) {
		var newChords = [];
		var chordsToClone = this.getChords(pos1, pos2);
		chordsToClone.forEach(function(chord) {
			var cChord = chord.clone();
			newChords.push(cChord);
		});
		return newChords;
	};

	/**
	 * Return the duration of a chord in beat
	 * @param  {int} index of chord in this.chords
	 * @return {int} number of beat the chord last
	 */
	ChordManager.prototype.getChordDuration = function(songModel, index) {
		if (typeof songModel === "undefined" || typeof index === "undefined" || isNaN(index)) {
			throw "ChordManager - getChordDuration - wrong arguments";
		}
		if (typeof this.chords[index] !== "undefined") {
			var currentBn = this.chords[index].getBarNumber();
			var currentBeat = this.chords[index].getBeat();
			var beats = songModel.getBeatsFromTimeSignature(songModel.getTimeSignatureAt(currentBn));
			if (typeof this.chords[index + 1] !== "undefined") {
				var nextBn = this.chords[index + 1].getBarNumber();
				var nextBeat = this.chords[index + 1].getBeat();
			} else {
				/*var nextChord = 0; // case last chords, we set next to the end*/
				var nextBn = currentBn + 1;
				var nextBeat = 1;
			}
			var duration = 0;
			if (nextBn === currentBn) { // if chord are on the same bar
				duration = nextBeat - currentBeat;
			} else if (nextBn > currentBn) {
				duration = beats * (nextBn - currentBn) + nextBeat - currentBeat;
			}
			return duration;
		}
		return undefined;
	}

	/**
	 * returns the index of the chord in the demanded position. If there is no chord with that exact position , it returns the closest previous one (or the following one, depending on 'next' param)
	 * returns also if it found the exact one or not
	 * @param  {Object} pos {	numBar: valNumBar,
	 *                      	numBeat: valNumBeat}
	 * @param  {boolean} next 	if true, when there is no chord found at the exact position we get the next one, if false or undefined, we get the previous one
	 * @return {Object}     {
	 *         					index: number
	 *         					exact: boolean
	 *         					}
	 */
	ChordManager.prototype.getChordIndexByPosition = function(pos, next) {
		function equalPosition(pos, chord) {
			return pos.numBar == chord.getBarNumber() && pos.numBeat == chord.getBeat();
		}
		//greater than
		function posGtChordPos(pos, chord) {
			return pos.numBar > chord.getBarNumber() || (pos.numBar == chord.getBarNumber() && pos.numBeat > chord.getBeat());
		}
		//less than
		function posLtChordPos(pos, chord) {
			return pos.numBar < chord.getBarNumber() || (pos.numBar == chord.getBarNumber() && pos.numBeat < chord.getBeat());
		}

		var chords = this.getChords();
		var r;
		for (var i = 0, c = chords.length; i < c; i++) {
			if (equalPosition(pos, chords[i])) {
				r = "equal";
				break;
			} else if (posGtChordPos(pos, chords[i])) {
				if (i + 1 == chords.length || posLtChordPos(pos, chords[i + 1])) {
					r = "greater";
					break;
				}
			}
		}
		if (next && r != "equal") i++;
		return {
			index: i,
			exact: r == "equal"
		};
	};

	/**
	 * getBeatIntervalByIndexes return the beat interval between chords[start] and chords[end] + chords[end] duration
	 * @interface
	 * @param  {integer} start
	 * @param  {integer} end
	 * @return {Array}
	 */
	ChordManager.prototype.getBeatIntervalByIndexes = function(start, end) {
		if (typeof start === "undefined" || isNaN(start) || typeof end === "undefined" || isNaN(end)) {
			throw 'Start and End parameters should be number';
		}
		var song = this.songModel;
		var startChord = this.getChord(start);
		var endChord = this.getChord(end);
		var startBeat = song.getBeatsBeforeBarNumber(startChord.getBarNumber()) + startChord.getBeat();
		var endBeat = song.getBeatsBeforeBarNumber(endChord.getBarNumber()) + 1 + song.getBeatsFromTimeSignatureAt(endChord.getBarNumber());
		return [startBeat, endBeat];
	};

	/**
	 * Function look which chords have their startbeat between startBeat and EndBeat
	 * It returns an array of 2 chords index, first index is the first chord that match, second is the last chord that match (it can be the same)
	 * by beat interval without including the last beat (just like in notes).
	 * E.g.: in a 4/4 song, with one chord per bar,  getIndexesStartingBetweenBeatInterval(1,6) would return [0,0]
	 * @interface
	 * @param  {Number} startBeat
	 * @param  {Number} endBeat
	 * @return {Array}  [indexStart, indexEnd]
	 */
	ChordManager.prototype.getIndexesStartingBetweenBeatInterval = function(startBeat, endBeat) {
		if (typeof startBeat === "undefined" || isNaN(startBeat) || typeof endBeat === "undefined" || isNaN(endBeat)) {
			throw 'Start and End parameters should be number';
		}
		var song = this.songModel;
		var pos1 = song.getPositionFromBeat(startBeat);
		var pos2 = song.getPositionFromBeat(endBeat);
		var index1 = this.getChordIndexByPosition(pos1, true);
		var index2 = this.getChordIndexByPosition(pos2);
		if (index2.exact) index2.index--;
		return [index1.index, index2.index];
	};

	return ChordManager;
});