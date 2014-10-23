define(['modules/core/src/NoteModel'], function(NoteModel) {
	return {
		run: function() {
			test("Notes", function(assert) {
				
				//empty note
				var note = new NoteModel();

				//setDot
				note.setDot();
				assert.equal(note.getDot(), 0);

			});
		}
	};


});