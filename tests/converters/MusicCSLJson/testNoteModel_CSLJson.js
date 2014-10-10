define(['modules/converters/MusicCSLJson/NoteModel_CSLJson', 'modules/core/NoteModel'], function(NoteModel_CSLJson, NoteModel) {
	return {
		run: function() {
			test("NoteModel_CSLJson", function(assert) {
				var note = new NoteModel();
				var CSLJsonConverter = new NoteModel_CSLJson();
				var t = CSLJsonConverter.exportToMusicCSLJSON(note);
				//assert.deepEqual(t, note.exportToMusicCSLJSON());
				expect(0);

			});
		}
	}
});