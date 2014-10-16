define(['modules/converters/MusicCSLJson/src/NoteManager_CSLJson', 'modules/core/src/NoteManager'], function(NoteManager_CSLJson, NoteManager) {
	return {
		run: function() {
			test("NoteManager_CSLJson", function(assert) {
				var nm = new NoteManager();
				var t = NoteManager_CSLJson.exportToMusicCSLJSON(nm);
				//assert.deepEqual(t, nm.exportToMusicCSLJSON());
				expect(0);

			});
		}
	}
});