define(['modules/core/NoteModel'], function(NoteModel) {
	return {
		run: function() {
			test("Notes", function(assert) {
				var note = new NoteModel();

				//setDot
				note.setDot(1);
				assert.equal(note.getDot(), 1);

				assert.throws(function() {
					note.setDot();
				});
				assert.throws(function() {
					note.setDot("ajajaj"); //throws exception
				});
				//setTie
				assert.throws(function() {
					note.setTie(); 
				});
				assert.throws(function() {
					note.setTie("mimportequoi"); 
				});
				note.setTie("start");
				assert.equal(note.getTie(),"start");
				
				note.setTie("start");
				assert.equal(note.getTie(),"start");

				note.setTie("stop");
				assert.equal(note.getTie(),"stop_start");				


				// var noteMinuscule = new NoteModel({
				// 	keys: ["e/4"],
				// 	duration: "q"
				// });
				// assert.equal(noteMinuscule.getPitch(), "E/4");

				// var polyphonicNote = new NoteModel({
				// 	keys: ["E/4", "C/4", "G#/3"],
				// 	duration: "q"
				// });
				// assert.equal(note.getPitch(0), "G#/3");
				// assert.equal(note.getPitch(1), "C/4");
				// assert.equal(note.getPitch(2), "E/4");

				// var restNote = new NoteModel("h");
				// assert.ok(restNote.isRest);

				// var restNote2 = new NoteModel("hr");
				// assert.ok(restNote.isRest);

				// var e4Note = new NoteModel({
				// 	keys: ["E/4"],
				// 	duration: "q"
				// });
				// assert.equal(note.getPitch(), "E/4");
				// assert.ok(!note.isRest);

			});
		}
	};


});