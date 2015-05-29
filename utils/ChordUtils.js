define(['jquery', 'utils/NoteUtils', 'utils/ChordTypesCollection'], function($, NoteUtils, ChordTypesCollection) {
	var ChordUtils = {};

	// TODO put in API
	/**
	 * Retrieve an list of object containing chordtypes and notes
	 * @return {function} call callback with an Sring containing notes transposed like ["Cm" = "C4, Eb4, G4",...]
	 * Warning, you probably will need to convert the string to array
	 */
	ChordUtils.getAllChordTypeFromDB = function(callback) {
		$.ajax({
			url: 'api/chordsTypesInfo.php',
			dataType: 'jsonp',
			type: 'POST',
			data: {
				action: 'getAllChordNotes'
			},
			success: function(data) {
				if (typeof callback !== "undefined") {
					if (typeof data !== "undefined" && data.allChordNotes) {
						callback(data);
					} else {
						callback('error ' + data);
					}
				}
			}
		});
	};

	ChordUtils.getAllChordTypes = function() {
		// case we already now allchords
		if (typeof ChordUtils.allChords !== "undefined") {
			return ChordUtils.chordTypeToNote;
		}
		// case a cache is available
		else if (typeof ChordTypesCollection !== "undefined") {
			ChordUtils.chordTypeToNote = [];
			// tool function, building an associative array between chordnames and chordnotes (C root)
			// Usage : chordTypeToNote['7b5'] will return ["C4", "E4", "Gb4", "Bb4"]

			var chord;
			for (var i = 0, c = ChordTypesCollection.length; i < c; i++) {
				chord = ChordTypesCollection[i];
				ChordUtils.chordTypeToNote[chord.ct] = NoteUtils.transformStringNote2ArrayNote(chord.cn);
			}
			return ChordUtils.chordTypeToNote;
		}
		// case we request database
		else {
			// tool function, building an associative array between chordnames and chordnotes (C root)
			// Usage : chordTypeToNote['7b5'] will return ["C4", "E4", "Gb4", "Bb4"]
			ChordUtils.chordTypeToNote = [];
			ChordUtils.getAllChordTypeFromDB(function(data) {
				for (var chord in data.allChordNotes) {
					ChordUtils.chordTypeToNote[chord] = NoteUtils.transformStringNote2ArrayNote(data.allChordNotes[chord]);
				}
			});
			return ChordUtils.chordTypeToNote;
		}
	};

	ChordUtils.getAllChordTypesAsArray = function() {
		// case we already now allchords
		if (typeof ChordUtils.chordTypes !== "undefined") {
			return ChordUtils.chordTypes;
		}
		else if (typeof ChordTypesCollection !== "undefined") {
			ChordUtils.chordTypes = [];
			for (var i = 0, c = ChordTypesCollection.length; i < c; i++) {
				ChordUtils.chordTypes.push(ChordTypesCollection[i].ct);
			}
			return ChordUtils.chordTypes;
		}
		else{
			return [];
		}
	};

	ChordUtils.getAllChords = function() {
		var chordTypes = this.getAllChordTypesAsArray();
		var pitchClasses = ["C", "C#", "Cb", "D", "D#", "Db", "E", "E#", "Eb", "F", "F#", "Fb", "G", "G#", "Gb", "A", "A#", "Ab", "B", "B#", "Bb", "%", "%%", "NC"];
		var chords = [];
		for (var pClass in pitchClasses) {
			if (pitchClasses[pClass].indexOf("%") != -1 || pitchClasses[pClass] == 'NC') {
				chords.push(pitchClasses[pClass]);
				continue;
			}
			for (var i = 0, c = chordTypes.length; i < c; i++) {
				if (typeof chordTypes[i] !== "undefined") {
					if (chordTypes[i].substring(0, 1) == "#" || chordTypes[i].substring(0, 1) == "b") chordTypes[i] = "_" + chordTypes[i];
					chords.push(pitchClasses[pClass] + chordTypes[i]);
				}
			}
		}
		ChordUtils.allChords = chords;
		return chords;
	};


	return ChordUtils;
});