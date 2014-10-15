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
			pc1 = pitch1.substring(0, 1).toUpperCase();
			oct1 = parseInt(pitch1.slice(-1), null);
			pc2 = pitch2.substring(0, 1).toUpperCase();
			oct2 = parseInt(pitch2.slice(-1), null);

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
			resultComparison;

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
	return NoteUtils;
});