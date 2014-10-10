define(['modules/converters/MusicCSLJson/SongModel_CSLJson', 'modules/core/SongModel'], function(SongModel_CSLJson, SongModel) {
	return {
		run: function() {
			test("SongModel_CSLJson", function(assert) {
				var song = new SongModel();
				var CSLJsonConverter = new SongModel_CSLJson();
				var t = CSLJsonConverter.exportToMusicCSLJSON(song);
				assert.deepEqual(t, song.exportToMusicCSLJSON());
			});
		}
	}
});