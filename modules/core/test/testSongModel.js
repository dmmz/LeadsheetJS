define([
	'tests/test-songs', 
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/core/src/TimeSignatureModel'
	], function(testSongs, SongModel, SongModel_CSLJson,TimeSignatureModel) {
	return {
		run: function() {
			test("Song", function(assert) {
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

				/* MISSING TESTS: 
					Song with no notes
					Song with no chords
					Export to song with 

				*/
			});
		}
	};
});