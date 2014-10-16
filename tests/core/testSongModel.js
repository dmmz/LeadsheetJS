define(['tests/test-songs', 'modules/core/SongModel', 'modules/converters/MusicCSLJson/SongModel_CSLJson'], function(testSongs, SongModel, SongModel_CSLJson) {
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
				assert.equal(song.getTimeSignatureAt(1),"4/4");
				assert.equal(song.getTimeSignatureAt(5),"3/4");
				assert.equal(song.getTimeSignatureAt(6),"3/4");



			});
		}
	};
});