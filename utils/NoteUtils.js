define(function() {

	var NoteUtils = {};
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
	}

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
	}

	return NoteUtils;
});