define(['utils/NoteUtils'], function(NoteUtils) {
	function ChordManagerModel(chords) {
		this.chords = chords ? chords : []; // array of chordModel
	};

	//Interface functions (this functions are also in NoteManagerModel  )
	//@interface
	ChordManagerModel.prototype.getTotal = function() {
		return this.chords.length;
	};

	/**
	 * @interface
	 * @param  {integer} start
	 * @param  {integer} end
	 * @return {Array}
	 */
	ChordManagerModel.prototype.getBeatIntervalByIndexes = function(start, end) {
		var song = this.songModel;
		var startChord = this.getChord(start);
		var endChord = this.getChord(end);
		var startBeat = song.getBeatsBeforeBarNumber(startChord.getBarNumber()) + startChord.getBeat();
		var endBeat = song.getBeatsBeforeBarNumber(endChord.getBarNumber()) + 1 + song.getBeatsFromTimeSignatureAt(endChord.getBarNumber());
		return [startBeat, endBeat];
	};

	/**
	 * @interface
	 *
	 * returns a copy of the notes from, pos1, to pos2.
	 * @param  {Integer} pos1
	 * @param  {Integer} pos2
	 * @param  {String} type : if "model" returns notes as copies of NoteMode Prototype, if "struct" it returns it in 'struct' fromat
	 * @return {[type]}      [description]
	 */
	ChordManagerModel.prototype.cloneElems = function(pos1, pos2, type) {
		type = type || "model";
		var newChords = [];
		var note;
		var chordsToClone = this.getChords(pos1, pos2);

		chordsToClone.forEach(function(chord) {
			var cChord;
			if (type == "struct")
				cChord = chord.toChordStruct();
			else
				cChord = chord.clone();

			newChords.push(cChord);
		});
		return newChords;
	};

	/**
	 * returns index of chords by beat interval without including the last beat (just like in notes).
	 * E.g.: in a 4/4 song, with one chord per bar,  getIndexesByBeatInterval(1,5) would return [0,0]
	 * @param  {Number} startBeat
	 * @param  {Number} endBeat
	 * @return {Array}           [indexStart, indexEnd]
	 */
	ChordManagerModel.prototype.getIndexesByBeatInterval = function(startBeat, endBeat) {
		var song = this.songModel;
		var pos1 = song.getPositionFromBeat(startBeat);
		var pos2 = song.getPositionFromBeat(endBeat);
		var index1 = this.getChordIndexByPosition(pos1, true);
		var index2 = this.getChordIndexByPosition(pos2);
		if (index2.exact) index2.index--;
		return [index1.index, index2.index];

	};

	ChordManagerModel.prototype.getChords = function(from, to) {
		return this.chords.slice(from, to);
	};

	ChordManagerModel.prototype.isEmpty = function() {
		return this.chords.length == 0;
	};

	ChordManagerModel.prototype.setAllChords = function(chords) {
		if (typeof chords !== "undefined") {
			this.chords = chords;
			return true;
		}
		return false;
	}

	ChordManagerModel.prototype.getChord = function(index) {
		if (typeof index !== "undefined" && !isNaN(index)) {
			if (this.chords[index]) {
				return this.chords[index];
			}
		}
		return undefined;
	}


	ChordManagerModel.prototype.getChordIndex = function(chord) {
		if (typeof chord !== "undefined" && chord instanceof ChordModel) {
			for (var i = 0; i < this.chords.length; i++) {
				if (JSON.stringify(this.getChord(i)) === JSON.stringify(chord)) {
					return i;
				}
			}
		}
		return undefined;
	}
	/**
	 * returns next position for a given chord. It's based on a 2 chords per bar grid.
	 * Searches next position in this grid. If it's already filled, does nothing
	 * @param  {boolean}		jump (if not defined, jumps by half bars, if true, jumps by bar)
	 * @param  {ChordModel}		chord from which we want to get next position
	 * @return {Object, null or string}  		Object: two fields: numBar, and numBeat
	 *                       					null when next
	 */

	ChordManagerModel.prototype.getNextPositionForNewChord = function(chord, jumpWholeBar) {
		var indexSelectedChord = this.getChordIndex(chord);
		var isLastChord = (indexSelectedChord == this.chords.length - 1)
		var nextChord = (isLastChord) ? null : this.getChord(indexSelectedChord + 1);

		var isInLastBar = (chord.getBarNumber() == this.songModel.getTotalNumberOfBars() - 1);

		var timeSig = this.songModel.getTimeSignatureAt(chord.getBarNumber());
		var numBeatsOnTimeSig = this.songModel.getBeatsFromTimeSignature(timeSig);
		var beatOnSecondHalfOfBar = Math.ceil(numBeatsOnTimeSig / 2) + 1;

		//chord is in 1st half, we create it in 2nd half of same Bar, if empty
		if (chord.getBeat() < beatOnSecondHalfOfBar && !jumpWholeBar) {

			if (isLastChord || nextChord.getBarNumber() != chord.getBarNumber()) {
				return {
					numBar: chord.getBarNumber(),
					numBeat: beatOnSecondHalfOfBar
				};
			}
		} //chord is in 2nd half, we create it in 1st beat of following bar
		else if ((isLastChord || chord.getBarNumber() + 1 < nextChord.getBarNumber()) && !isInLastBar) {
			return {
				numBar: chord.getBarNumber() + 1,
				numBeat: 1
			};
		} else if (isLastChord || isInLastBar) {
			return null;
		}
		//if next position is filled or we are in the end, return null
		return "filled";
	};

	ChordManagerModel.prototype.insertChord = function(index, chord) {
		if (typeof index !== "undefined" && !isNaN(index)) {
			if (typeof chord === "undefined" || !(chord instanceof ChordModel)) {
				var chord = new ChordModel;
			}
			this.chords.splice(index, 0, chord);
			return true;
		}
		return false;
	}

	/**
	 * Return the duration of a chord in the number of beat
	 * @param  {[int]} index of chord in this.chords
	 * @return {[int]} number of beat the chord last
	 */
	ChordManagerModel.prototype.getChordDuration = function(index) {
		if (typeof index !== "undefined" && !isNaN(index)) {
			if (typeof this.chords[index] !== "undefined") {
				var currentBn = this.chords[index].getBarNumber();
				var currentBeat = this.chords[index].getBeat();
				var beats = this.songModel.getBeatsFromTimeSignature(this.songModel.getTimeSignatureAt(currentBn));
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
		}
		return false;
	}

	ChordManagerModel.prototype.setChord = function(index, chord) {
		if (typeof chord !== "undefined" && chord instanceof ChordModel && typeof index !== "undefined" && !isNaN(index)) {
			this.chords[index] = chord;
			return true;
		}
		return false;
	}

	ChordManagerModel.prototype.getChordsByBeat = function(beat) {
		var chordsByBeat = [];
		if (typeof beat !== "undefined" && !isNaN(beat)) {
			var currentChord;
			for (var i = 0, c = this.chords.length; i < c; i++) {
				currentChord = this.chords[i];
				if (currentChord.getBeat() === beat) {
					chordsByBeat.push(currentChord);
				}
			}
		}
		return chordsByBeat;
	}

	ChordManagerModel.prototype.getChordsByBarNumber = function(barNumber) {
		var chordsByBarNumber = [];
		if (typeof barNumber !== "undefined" && !isNaN(barNumber)) {
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
	ChordManagerModel.prototype.getChordIndexByPosition = function(pos, next) {
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
		for (var i = 0; i < chords.length; i++) {
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

	ChordManagerModel.prototype.getStartTimeFromBarNumber = function(barNumber) {
		var duration, currentTime = 0;
		if (typeof this.chords !== "undefined" && typeof barNumber !== "undefined" && !isNaN(barNumber)) {
			for (var i = 0; i < this.chords.length; i++) {
				if (this.chords[i].getBarNumber() == barNumber) {
					return currentTime;
				}
				duration = this.getChordDuration(i);
				currentTime += duration;
			}
		}
	}


	ChordManagerModel.prototype.getDurationFromBarNumber = function(barNumber) {
		var duration = 0;
		if (typeof this.chords !== "undefined" && typeof barNumber !== "undefined" && !isNaN(barNumber)) {
			var bar = this.getChordsByBarNumber(barNumber);
			for (var i = 0, c = bar.length; i < c; i++) {
				duration += this.getChordDuration(this.getChordIndex(bar[i]));
			}
		}
		return duration;
	}

	ChordManagerModel.prototype.addChord = function(chord) {
		if (typeof chord !== "undefined" && chord instanceof ChordModel) {
			this.chords.push(chord);
			return true;
		} else {
			this.chords.push(new ChordModel);
			return true;
		}
		return false;
	}

	ChordManagerModel.prototype.removeChord = function(chord) {
		var chordIndex = this.getChordIndex(chord);
		this.removeChordByIndex(chordIndex);
	};


	ChordManagerModel.prototype.removeChordByIndex = function(index) {
		if (typeof index !== "undefined" && !isNaN(index)) {
			if (this.chords[index]) {
				var deletedChords = this.chords.splice(index, 1);
				delete deletedChords;
				// TODO, recalculate duration of previous chord
				return true;
			} else {
				console.info('ChordManagerModel.prototype.getChord - Trying to remove index which not exist');
			}
		}
		return false;
	};

	/**
	 * Return the index of numberOfChords chords before and after the selected chords
	 * @param  {[type]} numberOfChords [description]
	 * @return {[type]}                 [description]
	 */
	ChordManagerModel.prototype.getContextOfSelectedChords = function(cursor, numberOfChords) {
		var leftContext = [];
		var rightContext = [];
		for (var i = 1; i <= numberOfChords; i++) {
			if (cursor.getStart() - i >= 0) {
				leftContext.push(cursor.getStart() - i);
			}
			if (cursor.getEnd() + i < this.chords.length) {
				rightContext.push(cursor.getEnd() + i);
			}
		}
		return [leftContext, rightContext];
	}

	/*
	Params:
		arr1: array to which insert another array2
		cursor: array with start (cursor[0]) and end (cursor[1]) positions to override with new array2 
		arr2: array2 to be inserted
	returns resulting array
*/
	ChordManagerModel.prototype.arraySplice = function(arr1, cursor, arr2) {
		var part1 = arr1.slice(0, cursor[0]);
		var part2 = arr1.slice(cursor[1] + 1, arr1.length); //selected chords are removed
		return part1.concat(arr2, part2);
	}
	ChordManagerModel.prototype.pasteChords = function(cursor, buffer) {
		buffer = buffer || this.buffer;
		this.chords = this.arraySplice(this.chords, cursor, buffer);
	}

});