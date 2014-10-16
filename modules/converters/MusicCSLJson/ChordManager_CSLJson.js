define(['modules/core/ChordModel'], function(ChordModel) {
	function ChordManager_CSLJson(MusicCSLJSON) {};

	ChordManager_CSLJson.prototype.importFromMusicCSLJSON = function(MusicCSLJSON) {
		if (typeof MusicCSLJSON !== "undefined") {
			var chordsSection = [];
			var chordModel;
			var barNumber = 0;
			for (var i = 0; i < MusicCSLJSON.sections.length; i++) {
				for (var j = 0; j < chordsSection.length; j++) {
					for (var k = 0; k < chordsSection[j].length; k++) {
						chordModel = new ChordModel();
						chordModel.importFromMusicCSLJSON(chordsSection[j][k])
						chordModel.setBarNumber(barNumber);
						this.addChord(chordModel);
					}
					barNumber++;
				}
			}
		}
		return this;
	}

	ChordManager_CSLJson.prototype.exportToMusicCSLJSON = function(chordModel) {
		var chords = [];
		if (typeof chordModel.chords !== "undefined" && chordModel.chords.length) {
			var currentChord, currentBn;
			for (var i = 0; i < chordModel.chords.length; i++) {
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
	}
	return ChordManager_CSLJson;
});