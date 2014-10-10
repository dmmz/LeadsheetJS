define(['modules/converters/MusicCSLJson/SongModel_CSLJson', 'modules/core/SongModel', 'tests/test-songs'], function(SongModel_CSLJson, SongModel, testSong) {
	return {
		run: function() {
			test("SongModel_CSLJson", function(assert) {
				var song = new SongModel();
				var CSLJsonConverter = new SongModel_CSLJson();
				var songModel = CSLJsonConverter.importFromMusicCSLJSON(testSong.simpleLeadSheet, song);
				/*
				TODO, uncomment when getNotesBy Bar Number is back
				var exportedCSLJson = CSLJsonConverter.exportToMusicCSLJSON(songModel);
				assert.deepEqual(exportedCSLJson, testSong.simpleLeadSheet);
				*/
				expect(0);
			});
		}
	}
});