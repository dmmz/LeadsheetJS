define(['modules/core/src/ChordModel'], function(ChordModel) {
	var ChordManager_CSLJson = {};

	ChordManager_CSLJson.importFromMusicCSLJSON = function(MusicCSLJSON) {
		if (typeof MusicCSLJSON !== "undefined") {
			var chordsSection = [];
			var chordModel;
			var barNumber = 0;
			for (var i = 0, c = MusicCSLJSON.sections.length; i < c; i++) {
				for (var j = 0, v = chordsSection.length; j < v; j++) {
					for (var k = 0, b = chordsSection[j].length; k < b; k++) {
						chordModel = new ChordModel();
						chordModel.importFromMusicCSLJSON(chordsSection[j][k]);
						chordModel.setBarNumber(barNumber);
						this.addChord(chordModel);
					}
					barNumber++;
				}
			}
		}
		return this;
	};

	ChordManager_CSLJson.exportToMusicCSLJSON = function(chordModel) {
		var chords = [];
		if (typeof chordModel.chords !== "undefined" && chordModel.chords.length) {
			var currentChord, currentBn;
			for (var i = 0, c = chordModel.chords.length; i < c; i++) {
				currentChord = chordModel.getChord(i);
				currentBn = currentChord.getBarNumber();
				if (typeof chords[currentBn] === "undefined") {
					chords[currentBn] = [];
				}

				var jsonChord = {
					"beat": currentChord.getBeat(),
					"p": currentChord.getNote(),
					"ch": currentChord.getChordType(),
				};
				if (!currentChord.isEmptyBase()) {
					jsonChord.bp = currentChord.getBase().getNote();
					jsonChord.bch = currentChord.getBase().getChordType();
				}
				if (currentChord.getParenthesis()) {
					jsonChord.parenthesis = currentChord.getParenthesis();
				}
				chords[currentBn].push(jsonChord);
			}
		}
		return chords;
	};

	return ChordManager_CSLJson;
});