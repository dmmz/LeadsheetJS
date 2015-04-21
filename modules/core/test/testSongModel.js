define([
	'tests/test-songs',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/core/src/TimeSignatureModel'
	], function(testSongs, SongModel, SongModel_CSLJson,TimeSignatureModel) {
	return {
		run: function() {
			
			test("SongModel", function(assert) {
				function unfold() {

					var song = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.foldedSong);
					
					// getUnfoldedSongComponents
					var unfoldedBars = song.getUnfoldedSongComponents("notes");
					assert.equal(unfoldedBars.length,20,"getUnfoldedSongComponents: unfolded bars"); //we know there are 20 
					assert.equal(unfoldedBars[14][0].pitchClass[0],"A","getUnfoldedSongComponents: note in 14th bar has pitch A");
					
					var unfoldedSong = song.unfold();
					
					assert.deepEqual(
						song.getComponent("notes").getNotesAsString(),
						["Db/4-w", "E/4-w", "F/4-w", "A#/4-w", "C/5-w", "B/4-h", "A/4-h", "A/4-h", "qr", "qr", "B/4-w", "Ab/4-w", "G#/4-w",
						"D/5-w", "F/5-w", "E/5-w", "E/5-w"],
						"compare folded notes"
					);

					assert.deepEqual(
						unfoldedSong.getComponent("notes").getNotesAsString(),
						["Db/4-w", "E/4-w", "F/4-w", "A#/4-w",
						"Db/4-w", "E/4-w", "C/5-w", "B/4-h", "A/4-h",
						"Db/4-w", "E/4-w", "A/4-h", "qr", "qr", "B/4-w",
						"Db/4-w", "E/4-w", "Ab/4-w", "G#/4-w",
						"D/5-w", "F/5-w", "E/5-w", "E/5-w"],
						"compare unfolded notes"
					);

					assert.deepEqual(
						song.getComponent("chords").getChordsAsString(),
						["Dm", "F7", "Am", "G7", "E7", "F", "D", "G7", "CM7"],
						"compare folded chords"
					);

					assert.deepEqual(
						unfoldedSong.getComponent("chords").getChordsAsString(),
						["Dm", "F7",
						"Dm", "Am",
						"Dm", "G7",
						"Dm","E7", "F",
						"D", "G7", "CM7"],
						"compare unfolded chords"
					);
				}

				var song = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet, new SongModel());

				//Get Tonality
				song.getComponent('bars').getBar(5).setTonality("Eb");
				assert.equal(song.getTonalityAt(1), "C");
				assert.equal(song.getTonalityAt(5), "Eb");
				assert.equal(song.getTonalityAt(6), "Eb");

				// //Get TimeSignature
				song.getComponent('bars').getBar(5).setTimeSignature("3/4");

				assert.throws(function() {
					song.getTimeSignatureAt();
				});
				
				assert.deepEqual(song.getTimeSignatureAt(1).getBeats(), new TimeSignatureModel("4/4").getBeats());
				assert.deepEqual(song.getTimeSignatureAt(5).getBeats(), new TimeSignatureModel("3/4").getBeats());
				assert.deepEqual(song.getTimeSignatureAt(6).getBeats(), new TimeSignatureModel("3/4").getBeats());

				assert.equal(song.getSectionNumberFromBarNumber(0),0);
				assert.equal(song.getSectionNumberFromBarNumber(6),0);
				assert.equal(song.getSectionNumberFromBarNumber(10), undefined);

				assert.equal(song.getBarNumBeats(0),4);
				
				assert.equal(song.getStartBeatFromBarNumber(0),1);
				assert.equal(song.getStartBeatFromBarNumber(2),9);

				assert.equal(song.getSongTotalBeats(), 29);
				unfold();

				/* MISSING TESTS: 
					Song with no notes
					Song with no chords
					Export to song with 

				*/
			});
		}
	};
});