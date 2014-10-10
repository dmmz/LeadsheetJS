define(['modules/converters/MusicCSLJson/NoteManager_CSLJson', 'modules/core/NoteManager'], function(NoteManager_CSLJson, NoteManager) {
	return {
		run: function() {
			test("NoteManager_CSLJson", function(assert) {
				var nm = new NoteManager();
				var CSLJsonConverter = new NoteManager_CSLJson();
				var t = CSLJsonConverter.exportToMusicCSLJSON(nm);
				//assert.deepEqual(t, nm.exportToMusicCSLJSON());
				expect(0);

			});
		}
	}
});