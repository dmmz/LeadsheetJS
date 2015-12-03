define(['jquery', 'utils/NoteUtils', 'utils/ChordTypesCollection'], function($, NoteUtils, ChordTypesCollection) {
	var ChordUtils = {};

	ChordUtils.pitchClasses = ["C", "C#", "Cb", "D", "D#", "Db", "E", "E#", "Eb", "F", "F#", "Fb", "G", "G#", "Gb", "A", "A#", "Ab", "B", "B#", "Bb"];

	/**
	 * Retrieve an list of object containing chordtypes and notes
	 * @return {function} call callback with an Sring containing notes transposed like ["Cm" = "C4, Eb4, G4",...]
	 * Warning, you probably will need to convert the string to array
	 */
	ChordUtils.getAllChordTypeFromDB = function(callback) {
		$.ajax({
			url: 'api/ChordTypeInfoApi.php',
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
		if (typeof ChordUtils.allChords !== "undefined" && typeof ChordUtils.chordTypeToNote !== "undefined") {
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
		} else if (typeof ChordTypesCollection !== "undefined") {
			ChordUtils.chordTypes = [];
			for (var i = 0, c = ChordTypesCollection.length; i < c; i++) {
				ChordUtils.chordTypes.push(ChordTypesCollection[i].ct);
			}
			return ChordUtils.chordTypes;
		} else {
			return [];
		}
	};

	ChordUtils.getAllChords = function() {
		var chordTypes = this.getAllChordTypesAsArray();
		var pitchClasses = ChordUtils.pitchClasses;
		var chords = [];

		for (var i = 0, c = chordTypes.length; i < c; i++) {
			if (typeof chordTypes[i] !== "undefined") {
				for (var pClass in pitchClasses) {
					if (chordTypes[i].substring(0, 1) == "#" || chordTypes[i].substring(0, 1) == "b") chordTypes[i] = "_" + chordTypes[i];
					chords.push(pitchClasses[pClass] + chordTypes[i]);
				}
			}
		}
		chords.push('NC');
		chords.push('%');
		chords.push('%%');
		ChordUtils.allChords = chords;
		return chords;
	};
	/**
	 * [string2Json description]
	 * @param  {String} stringChord e.g. Am, Am9, Am/G, Am/Gm
	 * @return {Object}             e.g. {p:'A' ch:'m9', bp:'G', bch:'m'}
	 */
	ChordUtils.string2Json = function(stringChord) {

		function getNoteAndChordType(chordString) {
			chordString = chordString.replace(/\s/g, ''); //replace all (global g) spaces (\s) by '' 
			var pos;
			if (chordString.charAt(1) == "b" || chordString.charAt(1) == "#" || chordString.charAt(1) == "%")
				pos = 2;
			else if (chordString == "NC")
				pos = chordString.length;
			else
				pos = 1;

			note = chordString.substring(0, pos);
			chordType = chordString.substring(pos, chordString.length);
			return {
				note: note,
				chordType: chordType
			};
		}

		var chordType,
			note,
			base,
			chordTypes = ChordUtils.getAllChordTypesAsArray(),
			result,rBase;


		stringChord = stringChord.split('/');

		//we parse first part of chord e.g. in  Am7/G, we are parsing Am7
		result = getNoteAndChordType(stringChord[0]);
		chordType = result.chordType;
		note = result.note;

		//cases where chord are wrong or empty
		if (chordTypes.indexOf(chordType) === -1 ||
			ChordUtils.pitchClasses.indexOf(note) === -1 && note !== 'NC' && note.length !== 0) {
			return {
				error: true
			};
		} else if (note.length === 0) {
			return {
				empty: true
			};
		}

		var jsonChord = {
			p: note,
			ch: chordType
		};
		// we parse base part, e.g. in Am7/G, we parse G (we allow also base chords, e.g. Am/Gm)
		if (stringChord.length >= 2) {
			rBase = getNoteAndChordType(stringChord[1]);
			if (rBase) {
				jsonChord.bp = rBase.note;
				if (rBase.chordType) {
					jsonChord.bch = rBase.chordType;
				}
			}
		}
		return jsonChord;
	};
	return ChordUtils;
});