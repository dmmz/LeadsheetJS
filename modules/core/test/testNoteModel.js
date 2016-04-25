define(['modules/core/src/NoteModel'], function(NoteModel) {
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
				assert.equal(note.getTie(), undefined);

				assert.throws(function() {
					note.setTie("wrongTie");
				});
				note.setTie("start");
				assert.equal(note.getTie(), "start", "add tie note");

				note.setTie("start");
				assert.equal(note.getTie(), "start");

				note.setTie("stop");
				assert.equal(note.getTie(), "stop_start");

				note.removeTie();
				assert.equal(note.getTie(), undefined, "remove tie note");


				//tuplet
				assert.throws(function() {
					note.setTuplet("wrongValidType");
				});
				note.setTuplet("start");
				assert.equal(note.getTuplet(), "start");
				assert.equal(note.getTimeModification(), "3/2");
				assert.ok(note.isTuplet());

				note.removeTuplet();
				assert.equal(note.getTuplet(), null);
				assert.equal(note.getTimeModification(), null);
				assert.ok(!note.isTuplet());

				note.setTuplet(null, "5/4");
				assert.equal(note.getTuplet(), "middle");
				assert.equal(note.getTimeModification(), "5/4");
				assert.ok(note.isTuplet());

				note.setTuplet("middle", "3/4");
				assert.equal(note.getTuplet(), "middle");
				assert.equal(note.getTimeModification(), "3/4");
				assert.ok(note.isTuplet());

				//measure
				/*assert.throws(function() {
					note.setMeasure("wrongMeasure");
				});
				note.setMeasure(2);
				assert.equal(note.getMeasure(),2);*/

				//accidental
				assert.throws(function() {
					note.setAccidental("invalidAcc");
				});

				note.setAccidental("#");
				assert.equal(note.getAccidental(), "#");
				note.removeAccidental();
				assert.equal(note.getAccidental(), "");


				var noteMinuscule = new NoteModel({
					pitchList: ["e/4"],
					duration: "q"
				});
				assert.equal(noteMinuscule.getPitch(), "E/4", 'note minuscule');
				assert.equal(noteMinuscule.getNumPitches(), 1);

				var polyphonicNote = new NoteModel({
					pitchList: ["E/4", "C/4", "G#/3"],
					duration: "q"
				});

				assert.equal(polyphonicNote.getPitch(0), "G#/3", 'polyphonic');
				assert.equal(polyphonicNote.getPitch(1), "C/4");
				assert.equal(polyphonicNote.getPitch(2), "E/4");
				assert.equal(polyphonicNote.getNumPitches(), 3);

				var restNote = new NoteModel("h");
				assert.equal(restNote.getDuration(), 2, 'rest note');
				assert.ok(restNote.isRest);

				restNote = new NoteModel("hr");
				assert.equal(restNote.getDuration(), 2);
				assert.ok(restNote.isRest);

				var inlineNote = new NoteModel('C#/4-8.');
				assert.equal(inlineNote.getPitch(), 'C#/4', 'inline note');
				assert.equal(inlineNote.getNumPitches(), 1);
				assert.equal(inlineNote.getAccidental(), "#");
				assert.equal(inlineNote.getDuration(), 0.75);
				assert.equal(inlineNote.getDot(), 1);
				assert.equal(inlineNote.getTie(), undefined);
				assert.equal(inlineNote.getTuplet(), null);
				assert.equal(inlineNote.getTimeModification(), null);
				assert.ok(!inlineNote.isRest);
				assert.equal(inlineNote.toString(), 'C#/4-8.');

				var inlineNote2 = new NoteModel('16r');
				assert.equal(inlineNote2.getDuration(), 0.25);
				assert.ok(inlineNote2.isRest, 'is a silence');
				assert.equal(inlineNote2.toString(), '16r');



				var clonedNote = inlineNote.clone();
				assert.deepEqual(clonedNote, inlineNote, "clone test");

				var clonedNotes2 = inlineNote2.clone();
				assert.deepEqual(clonedNotes2, inlineNote2, "clone test with silence");

				var noteSilenceDot = new NoteModel('q.r');
				assert.equal(noteSilenceDot.getDot(), 1, 'q.r has dot');

				var noteSilenceDoubleDot = new NoteModel('q..r');
				assert.equal(noteSilenceDoubleDot.getDot(), 2, 'q..r has 2 dots');


				// set duration functions
				var durNote = new NoteModel('A/4-q');
				assert.equal(durNote.getDot(), 0, 'no dot for quarter note');
				assert.throws(
					function() {
						durNote.setDurationByBeats(1.3333);
					}, 
					/fraction of 2/, 
					'should throw exception containing "should be fraction of 2"'
				);
				assert.throws(function() {
					durNote.setDurationByBeats('1.3333');
				});
				assert.throws(function() {
					durNote.setDuration('1.3333');
				});

				var dur;

				function testDuration (dur, dot, strDur, titleTest) {
					durNote.setDurationByBeats(dur);
					assert.equal(durNote.getDot(), dot, titleTest);
					assert.equal(durNote.duration, strDur);
					assert.equal(durNote.getDuration(), dur);
				}
				
				testDuration(6, 1, 'w','whole note with dot');
				testDuration(7, 2, 'w','whole note with double dot');
				testDuration(4, 0, 'w','whole note, no dot');
				testDuration(3, 1, 'h','half note with dot');
				testDuration(2, 0, 'h','half note, no dot');
				testDuration(3.5, 2, 'h','half note with double dot');
				testDuration(1.5, 1,'q','quarter note with dot');
				testDuration(1, 0,'q','no dot');
				testDuration(1.75, 2,'q','quarter note with double dot');
				testDuration(0.875,2,'8','8th note with double dot');
				testDuration(0.75,1,'8','8th note with dot');
				testDuration(0.5,0,'8','8th note with no dot');
				testDuration(0.4375,2,'16', '16th note with double dot');
				testDuration(0.375,1,'16','16th note with dot');
				testDuration(0.25,0,'16','16th note with no dot');
				testDuration(0.21875,2,'32','32th note with double dot');
				testDuration(0.1875,1,'32','32th note with dot');
				testDuration(0.125,0,'32','32th note with no dot');
				testDuration(0.109375,2,'64','64th note with double dot');
				testDuration(0.09375,1,'64','64th note with dot');
				testDuration(0.0625,0,'64','64th note with no dot');

				assert.throws(function() {
					durNote.setDurationByBeats('whatever');
				});

				assert.throws(function() {
					durNote.setDuration('whatever');
				});

				assert.throws(function() {
					durNote.setDuration(1.2346);
				});
				durNote.setDurationByBeats(1.5);

				assert.throws(function() {
					durNote.setDurationByBeats(1.2346);
				});

				dur = 'h';
				durNote.setDuration(dur);
				assert.equal(durNote.duration, dur);
				assert.equal(durNote.getDuration(), 3, 'setDuration does not modifies dots, we have getDot == 1');
				durNote.setDot(0);
				assert.equal(durNote.getDuration(), 2, 'now it is the duration of h');

			});
		}
	};


});