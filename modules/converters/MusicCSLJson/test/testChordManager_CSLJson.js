define(['modules/converters/MusicCSLJson/src/ChordManager_CSLJson', 'modules/core/src/ChordManager'], function(ChordManager_CSLJson, ChordManager) {
	return {
		run: function() {
			test("ChordManager_CSLJson", function(assert) {
				var cm = new ChordManager();
				var t = ChordManager_CSLJson.exportToMusicCSLJSON(cm);
				assert.deepEqual(t, []);

				// assert.deepEqual(t, cm.exportToMusicCSLJSON());
				
			});
		}
	}
});