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
	}


	ChordUtils.getAllChords = function() {
		// case we already now allchords
		if (typeof ChordUtils.allChords !== "undefined") {
			return ChordUtils.chordTypeToNote;
		}
		// case a cache is available
		else if (typeof ChordTypesCollection !== "undefined") {
			ChordUtils.chordTypeToNote = [];
			// tool function, building an associative array between chordnames and chordnotes (C root)
			// Usage : chordTypeToNote['7b5'] will return ["C4", "E4", "Gb4", "Bb4"]
			for (chord in ChordTypesCollection.allChordNotes) {
				ChordUtils.chordTypeToNote[chord] = NoteUtils.transformStringNote2ArrayNote(ChordTypesCollection.allChordNotes[chord]);
			}
			return ChordUtils.chordTypeToNote;
		}
		// case we request database
		else {
			// tool function, building an associative array between chordnames and chordnotes (C root)
			// Usage : chordTypeToNote['7b5'] will return ["C4", "E4", "Gb4", "Bb4"]
			ChordUtils.chordTypeToNote = [];
			ChordUtils.getAllChordTypeFromDB(function(data) {
				for (chord in data.allChordNotes) {
					ChordUtils.chordTypeToNote[chord] = NoteUtils.transformStringNote2ArrayNote(data.allChordNotes[chord]);
				}
			});
			return ChordUtils.chordTypeToNote;
		}
	};

	return ChordUtils;
});