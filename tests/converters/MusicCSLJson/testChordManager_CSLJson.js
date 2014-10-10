define(['modules/converters/MusicCSLJson/ChordManager_CSLJson', 'modules/core/ChordManager'], function(ChordManager_CSLJson, ChordManager) {
	return {
		run: function() {
			test("ChordManager_CSLJson", function(assert) {
				var cm = new ChordManager();
				var CSLJsonConverter = new ChordManager_CSLJson();
				var t = CSLJsonConverter.exportToMusicCSLJSON(cm);
				// assert.deepEqual(t, cm.exportToMusicCSLJSON());
				expect(0);
			});
		}
	}
});