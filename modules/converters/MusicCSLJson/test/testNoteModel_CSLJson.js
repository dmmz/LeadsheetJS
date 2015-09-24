define(['modules/converters/MusicCSLJson/src/NoteModel_CSLJson', 'modules/core/src/NoteModel'], function(NoteModel_CSLJson, NoteModel) {
	return {
		run: function() {
			test("NoteModel_CSLJson", function(assert) {
				var note = new NoteModel('h');
				var t = NoteModel_CSLJson.exportToMusicCSLJSON(note);
				
				// testing default export
				assert.deepEqual(t, {dot:0,duration:'hr',keys:["B/4"]}, "export");

				/*
				// testing export
				var chord = new NoteModel('h');
				var exp = CSLJsonConverter.exportToMusicCSLJSON(chord);
				assert.deepEqual(exp,{} );

				
				// testing import
				var newChord = new NoteModel();
				CSLJsonConverter.importFromMusicCSLJSON(exp, newChord);
				var exp2 = CSLJsonConverter.exportToMusicCSLJSON(newChord);
				assert.deepEqual(exp2,{} );
				*/
			});
		}
	}
});