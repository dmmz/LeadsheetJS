define(['modules/core/NoteModel'], function(NoteModel) {
	return {
		run: function() {
			test("Notes", function(assert) {
				
				//empty note
				var note = new NoteModel();

				//setDot
				note.setDot();
				assert.equal(note.getDot(), 0);

				note.setDot(1);
				assert.equal(note.getDot(), 1);
				
				assert.throws(function() {
					note.setDot("wrongDot"); 
				});

				//setTie
				note.setTie();
				assert.equal(note.getTie(),undefined); 
				
				assert.throws(function() {
					note.setTie("wrongTie"); 
				});
				note.setTie("start");
				assert.equal(note.getTie(),"start");
				
				note.setTie("start");
				assert.equal(note.getTie(),"start");

				note.setTie("stop");
				assert.equal(note.getTie(),"stop_start");				
				
				//tuplet
				assert.throws(function() {
					note.setTuplet("wrongValidType");
				});
				note.setTuplet("start");
				assert.equal(note.getTuplet(),"start");
				assert.equal(note.getTimeModification(),"3/2");
				assert.ok(note.isTuplet());

				note.removeTuplet();
				assert.equal(note.getTuplet(),null);
				assert.equal(note.getTimeModification(),null);				
				assert.ok(!note.isTuplet());
				
				note.setTuplet(null,"5/4");
				assert.equal(note.getTuplet(),"middle");
				assert.equal(note.getTimeModification(),"5/4");
				assert.ok(note.isTuplet());

				note.setTuplet("middle","3/4");
				assert.equal(note.getTuplet(),"middle");
				assert.equal(note.getTimeModification(),"3/4");
				assert.ok(note.isTuplet());

				//measure
				/*assert.throws(function() {
					note.setMeasure("wrongMeasure");
				});
				note.setMeasure(2);
				assert.equal(note.getMeasure(),2);*/

				//accidental
				assert.throws(function(){
					note.setAccidental("invalidAcc");	
				});
				
				note.setAccidental("#");
				assert.equal(note.getAccidental(),"#");
				note.removeAccidental();
				assert.equal(note.getAccidental(),"");
				

				var noteMinuscule = new NoteModel({
					pitchList: ["E/4"],
					duration: "q"
				});
				assert.equal(noteMinuscule.getPitch(), "E/4");
				assert.equal(noteMinuscule.getNumPitches(), 1);

				var polyphonicNote = new NoteModel({
					pitchList: ["E/4", "C/4", "G#/3"],
					duration: "q"
				});

				assert.equal(polyphonicNote.getPitch(0), "G#/3");
				assert.equal(polyphonicNote.getPitch(1), "C/4");
				assert.equal(polyphonicNote.getPitch(2), "E/4");
				assert.equal(polyphonicNote.getNumPitches(), 3);

				var restNote = new NoteModel("h");
				assert.equal(restNote.getDuration(),2);
				assert.ok(restNote.isRest);

				restNote = new NoteModel("hr");
				assert.equal(restNote.getDuration(),2);
				assert.ok(restNote.isRest);

				var inlineNote = new NoteModel('C#/4-8.');
				assert.equal(inlineNote.getPitch(),'C#/4');
				assert.equal(inlineNote.getNumPitches(),1);
				assert.equal(inlineNote.getAccidental(),"#");
				assert.equal(inlineNote.getDuration(),3);
				assert.equal(inlineNote.getDot(),1);
				assert.equal(inlineNote.getTie(),undefined); 
				assert.equal(inlineNote.getTuplet(),null);
				assert.equal(inlineNote.getTimeModification(),null);
				assert.ok(!inlineNote.isRest);
				

			});
		}
	};


});