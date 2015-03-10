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
		number2PitchArray = {
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


	NoteUtils.durationToNotes = function(duration, initBeat) {
		var durs = ["q", "8", "16", "32", "64"];

		function findDur(arrNotes, duration) {
			arrNotes = arrNotes || [];
			var matchedDur = 1;
			var iDur = 0;
			while (iDur <= durs.length) {
				if (duration == matchedDur) {
					arrNotes.push(durs[iDur]);
					break;
				} else if (duration > matchedDur) {
					arrNotes.push(durs[iDur]);
					arrNotes = findDur(arrNotes, duration - matchedDur);
					break;
				}
				iDur++;
				matchedDur /= 2;
			}
			return arrNotes;
		}

		var notes = [];

		/* this "if" code assures that in the special case with two condition: 
				1. replaced frase starts at a non absolute beat (4.5, 4.25..etc)
				2. duration is longer than firstSilenceDur, which is difference with following absolute beat 
				(i.e. if 4.5 -> difference is 0.5, if 4.25, difference is 0.75)
			this is normally the case when we remove several measures starting from, beat 4.5 in a measure
			We can check it relative to the absolute beat beacause the biggest figure is a quarter note 
			(if we created half notes or whole notes, we should check it relative to those figures), also, this would give problems
			in measures with no exact number of quarter beats: e.g.: 3/8 (= 1.5 beats) 5/8 (2.5 beats...etc.)
		*/
		if (initBeat != null) {
			initBeat = Number(initBeat);
			var residuBeat = initBeat - Math.floor(initBeat);
			if (residuBeat !== 0) {
				var firstSilenceDur = 1 - residuBeat;
				if (duration > firstSilenceDur) {
					notes = findDur(notes, firstSilenceDur);
					duration -= firstSilenceDur;
				}
			}
		}

		return findDur(notes, duration);
	};


	return NoteUtils;
});