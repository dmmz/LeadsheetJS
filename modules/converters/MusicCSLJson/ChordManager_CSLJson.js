define(['modules/core/ChordModel'], function(ChordModel) {
	function ChordModel_CSLJson(MusicCSLJSON) {

	};

	ChordModel_CSLJson.prototype.musicCSLJson2SongModel = function(MusicCSLJSON) {
		if (typeof MusicCSLJSON !== "undefined") {
			var chordsSection = [];
			var chordModel;
			var barNumber = 0;
			console.log(MusicCSLJSON);
			for (var i = 0; i < MusicCSLJSON.sections.length; i++) {
				if (typeof MusicCSLJSON.sections[i].chords !== "undefined") {
					if (MusicCSLJSON.sections[i].hasOwnProperty('chords')) {
						chordsSection = Utils.clone(MusicCSLJSON.sections[i].chords);
					}
				}

				if (chordsSection) {
					console.log("yes chordSection");
					for (var j = 0; j < chordsSection.length; j++) {
						for (var k = 0; k < chordsSection[j].length; k++) {
							chordModel = new ChordModel();
							chordModel.musicCSLJson2SongModel(chordsSection[j][k])
							chordModel.setBarNumber(barNumber);
							this.addChord(chordModel);
						}
						barNumber++;
					}
				}
			}
		}
		return this;
	}

	ChordModel_CSLJson.prototype.songModel2MusicCSLJson = function(songModel) {
		var chords = [];
		if (typeof this.chords !== "undefined" && this.chords.length) {
			var currentChord, currentBn;
			for (var i = 0; i < this.chords.length; i++) {
				currentChord = this.getChord(i);
				currentBn = currentChord.getBarNumber();
				if (typeof chords[currentBn] === "undefined") {
					chords[currentBn] = [];
				}
				var existsBase = !$.isEmptyObject(currentChord.getBase());

				var jsonChord = {
					"beat": currentChord.getBeat(),
					"p": currentChord.getNote(),
					"ch": currentChord.getChordType(),
				};
				if (existsBase) {
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
	return ChordModel_CSLJson;
});