define(function() {
	var NoteUtils = {};
	NoteUtils.PITCH_CLASSES = ["C", "D", "E", "F", "G", "A", "B"];
	NoteUtils.DURATIONS = {
		4: "w",
		2: "h",
		1: "q",
		0.5: "8",
		0.25: "16",
		0.125: "32",
		0.0625: "64"
	};
	NoteUtils.ARR_DUR = [{
		strDur: 'w',
		numDur: 4
	}, {
		strDur: 'h',
		numDur: 2
	}, {
		strDur: 'q',
		numDur: 1
	}, {
		strDur: '8',
		numDur: 0.5
	}, {
		strDur: '16',
		numDur: 0.25
	}, {
		strDur: '32',
		numDur: 0.125
	}, {
		strDur: '64',
		numDur: 0.0625
	}];

	NoteUtils.getStringFromBeatDuration = function(beat) {
		return NoteUtils.DURATIONS[beat];
	};

	NoteUtils.getBeatFromStringDuration = function(string) {
		for (var dur in NoteUtils.DURATIONS) {
			if (NoteUtils.DURATIONS[dur] === string) {
				return Number(dur);
			}
		}
	};

	/**
	 * sorting pitches in case of polyphony because Vexflow adds accidentals in order relating to pitch order,
	 * not to the actual array order
	 * @param  {Array} pitches e.g.: ["A"]
	 * @return {Array}         [description]
	 */
	NoteUtils.sortPitches = function(pitches) {

		/**
		 * @param  {string} pitch1 example: "A/4"
		 * @param  {string} pitch2 example: "Db/3"
		 * @return {int}    1 if (pitch1>pitch2), 0 if they are equal, -1 if (pitch1<pitch2)
		 */
		function comparePitches(pitch1, pitch2) {
			var r;
			var pc1 = pitch1.substring(0, 1).toUpperCase();
			var oct1 = parseInt(pitch1.slice(-1), null);
			var pc2 = pitch2.substring(0, 1).toUpperCase();
			var oct2 = parseInt(pitch2.slice(-1), null);

			if (oct1 > oct2) r = 1;
			else if (oct1 < oct2) r = -1;
			else { //if equal
				var map = {
					"C": 0,
					"D": 1,
					"E": 2,
					"F": 3,
					"G": 4,
					"A": 5,
					"B": 6
				};

				if (map[pc1] > map[pc2]) r = 1;
				if (map[pc1] < map[pc2]) r = -1;
				else r = 0;
			}
			return r;
		}

		var pitchClass,
			octave,
			sortedPitches = [],
			curPitch,
			prevPitch = null,
			i = 0,
			inserted,
			op,
			resultComparison,
			oPitch;

		for (var p in pitches) {
			curPitch = pitches[p];
			if (sortedPitches.length === 0) {
				sortedPitches.push(curPitch);
			} else {
				inserted = false;
				op = 0;
				while (inserted === false && op < sortedPitches.length) {
					oPitch = sortedPitches[op];
					resultComparison = comparePitches(curPitch, oPitch);
					if (resultComparison < 0) {
						sortedPitches.splice(op, 0, curPitch);
						inserted = true;
					}
					op++;
				}
				if (inserted === false) {
					sortedPitches.push(curPitch);
				}
			}

		}
		return sortedPitches;
	};

	NoteUtils.pitch2Number = function(pitch) {
		var pitch2NumberArray = {
			"C": 0,
			"C#": 1,
			"Db": 1,
			"D": 2,
			"D#": 3,
			"Eb": 3,
			"E": 4,
			"Fb": 4,
			"E#": 5,
			"F": 5,
			"F#": 6,
			"Gb": 6,
			"G": 7,
			"G#": 8,
			"Ab": 8,
			"A": 9,
			"A#": 10,
			"Bb": 10,
			"B": 11,
			"Cb": 11,
			"B#": 0,
		};
		var number;
		if (typeof pitch2NumberArray[pitch] !== "undefined") {
			number = pitch2NumberArray[pitch];
		}
		return number;
	};

	NoteUtils.number2Pitch = function(number) {
		var number2PitchArray = {
			0: "C",
			1: "C#",
			2: "D",
			3: "D#",
			4: "E",
			5: "F",
			6: "F#",
			7: "G",
			8: "G#",
			9: "A",
			10: "A#",
			11: "B",
		};
		number = (number + 12) % 12;
		var pitch;
		if (typeof number2PitchArray[number] !== "undefined") {
			pitch = number2PitchArray[number];
		}
		return pitch;
	};

	NoteUtils.transformStringNote2ArrayNote = function(chordString) {
		var chordArray = [];
		if (typeof chordString !== "undefined") {
			var chord = chordString.split(',');
			for (var i = 0; i < chord.length; i++) {
				var s = (/[A-Z][b,#]{0,2}[0-9]?/i).exec(chord[i]);
				if (s) {
					chordArray.push(s[0]);
				}
			}
		}
		return chordArray;
	};

	NoteUtils.getValidPitch = function(value) {
		var re = /[a-g|A-G]/;
		if (typeof value === "number") {
			return -1;
		} else {
			if (!value.match(re))
				return -1;
			else
				return value.toUpperCase();
		}

	};

	NoteUtils.getClosestKey = function(pitch, pitchClass2) {
		var pitchClass = pitch.split('/')[0];
		var pos1 = this.getKeyPosition(pitchClass);
		var pos2 = this.getKeyPosition(pitchClass2);
		var d1 = pos2 - pos1;
		var d2 = this.PITCH_CLASSES.length - Math.abs(d1);
		if (d1 > 0) d2 *= -1;
		var inc = (Math.abs(d2) < Math.abs(d1)) ? d2 : d1;

		return this.getKey(pitch, inc);
	};

	NoteUtils.getKeyPosition = function(key) {
		for (var i = 0; i < this.PITCH_CLASSES.length; i++) {
			if (this.PITCH_CLASSES[i] == key.toUpperCase()) break;
		}
		return i;
	};


	NoteUtils.getKey = function(key, inc) {
		var keyParts = key.split("/");
		var pitch = keyParts[0];
		var accidentals = "";
		if (typeof pitch[1] !== "undefined") {
			accidentals = pitch[1];
		}
		var octave = parseInt(keyParts[1], null);

		var newAbsPos = this.getKeyPosition(pitch[0]) + inc;
		var newPos = newAbsPos % this.PITCH_CLASSES.length;
		if (newPos < 0) newPos += this.PITCH_CLASSES.length;

		var octavesInc = Math.floor(newAbsPos / this.PITCH_CLASSES.length);

		var newOctave = octave + octavesInc;
		//range: from e/3 to f/6
		if ((newOctave <= 1 && newPos < 2) || (newOctave >= 7 && newPos > 3)) return null;
		else return this.PITCH_CLASSES[newPos] + accidentals + "/" + newOctave;
	};

	/**
	 * @param  {Number}		4.5, 
	 * @param  {Number}		0.5
	 * @return {Array}		array of notes
	 */
	NoteUtils.durationToNotes = function(duration, initBeat) {

		var durs = ["w", "h", "q", "8", "16", "32", "64"];



		function findDur(arrNotes, indexes, duration) {
			arrNotes = arrNotes || [];
			indexes = indexes || [];
			var matchedDur = 4;
			var iDur = 0;
			while (iDur <= durs.length) {
				if (duration == matchedDur) {
					arrNotes.push(durs[iDur]);
					indexes.push(iDur);
					break;
				} else if (duration > matchedDur) {
					arrNotes.push(durs[iDur]);
					indexes.push(iDur);
					arrNotes = findDur(arrNotes, indexes, duration - matchedDur);
					break;
				}
				iDur++;
				matchedDur /= 2;
			}
			return {
				notes: arrNotes,
				indexes: indexes
			}
		}

		function mergeByDot(notes, indexes) {
			var mergedNotes = [],
				dot = 0,
				curIndex, prevIndex,
				curNote, prevNote;

			for (var i = notes.length - 1; i > 0; i--) {
				curIndex = indexes[i];
				prevIndex = indexes[i - 1];

				if (curIndex - 1 === prevIndex) {
					if (dot === 0) {
						dot++;
						notes[i - 1] += ".";
					} 
					else if (dot === 1){
						dot++;
						notes[i - 1] += "..";
					}
					else {
						dot = 0;
						mergedNotes.push(notes[i]);
					}
				} else {
					mergedNotes.push(notes[i]);
				}
			}
			mergedNotes.push(notes[i]);
			return mergedNotes;
		}

		var notes = [];
		var indexes = [];
		findDur(notes, indexes, duration);
		// console.log(notes);
		// console.log(indexes);
		notes = mergeByDot(notes,indexes);

		return notes;
	};


	return NoteUtils;
});