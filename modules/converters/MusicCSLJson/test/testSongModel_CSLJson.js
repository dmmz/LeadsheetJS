define(['modules/converters/MusicCSLJson/src/SongModel_CSLJson', 'modules/core/src/SongModel', 'tests/test-songs'], function(SongModel_CSLJson, SongModel, testSong) {
	return {
		run: function() {
			test("SongModel_CSLJson", function(assert) {
				var song = new SongModel();
				var songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSong.simpleLeadSheet, song);
								
				var exportedCSLJson = SongModel_CSLJson.exportToMusicCSLJSON(songModel);
				//assert.deepEqual(exportedCSLJson, testSong.simpleLeadSheet);
				
				expect(0);
			});
		}
	}
});