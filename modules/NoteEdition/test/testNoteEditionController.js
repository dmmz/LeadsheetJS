define(['modules/core/src/NoteModel',
	'modules/NoteEdition/src/NoteEditionController',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/Cursor/src/CursorModel',
	'tests/test-songs'
], function(NoteModel, NoteEditionController, SongModel_CSLJson, CursorModel, testSongs) {
	return {
		run: function() {
			test("Notes Edition Controller", function(assert) {

				var songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);
				var cM = new CursorModel(songModel.getComponent('notes'));
				var nec = new NoteEditionController(songModel, cM);

				assert.equal(nec.getSelectedNotes().toString(), "A4");

				// Pitch
				nec.setPitch(1);
				assert.equal(nec.getSelectedNotes().toString(), "B4");

				nec.setPitch("C");
				assert.equal(nec.getSelectedNotes().toString(), "C5");

				// Wrong insert (accidental should be specified like this)
				nec.setPitch("Db");
				assert.equal(nec.getSelectedNotes().toString(), "C5");

				// Accidentals
				nec.addAccidental("b");
				assert.equal(nec.getSelectedNotes().toString(), "Cb5", 'accidental flat');

				nec.addAccidental("bb");
				assert.equal(nec.getSelectedNotes().toString(), "Cbb5");

				nec.addAccidental("#");
				assert.equal(nec.getSelectedNotes().toString(), "C#5");

				nec.addAccidental("##");
				assert.equal(nec.getSelectedNotes().toString(), "C##5");

				nec.addAccidental("n");
				assert.equal(nec.getSelectedNotes().toString(), "Cn5");

				// remove if same
				nec.addAccidental("n");
				assert.equal(nec.getSelectedNotes().toString(), "C5", 'remove accidental');

				// Durations
				nec.setCurrDuration("1");
				assert.equal(nec.getSelectedNotes()[0].getDuration(), 0.0625, 'durations 1');
				nec.setCurrDuration("2");
				assert.equal(nec.getSelectedNotes()[0].getDuration(), 0.125, 'durations 2');
				nec.setCurrDuration("3");
				assert.equal(nec.getSelectedNotes()[0].getDuration(), 0.25, 'durations 3');
				nec.setCurrDuration("4");
				assert.equal(nec.getSelectedNotes()[0].getDuration(), 0.5, 'durations 4');
				nec.setCurrDuration("5");
				assert.equal(nec.getSelectedNotes()[0].getDuration(), 1, 'durations 5');
				nec.setCurrDuration("6");
				assert.equal(nec.getSelectedNotes()[0].getDuration(), 2, 'durations 6');
				nec.setCurrDuration("7");
				assert.equal(nec.getSelectedNotes()[0].getDuration(), 4, 'durations 7');
				nec.setCurrDuration("8");
				assert.equal(nec.getSelectedNotes()[0].getDuration(), 4, 'durations 8');
				assert.throws(function() {
					nec.setCurrDuration("9");
				});


				nec.setDot();
				assert.equal(nec.getSelectedNotes()[0].getDuration(), 6, 'dot');

				nec.setSilence();
				assert.ok(nec.getSelectedNotes()[0].isRest, 'rest');

				// add note
				var note = nec.getSelectedNotes().toString();
				nec.addNote();
				assert.equal(nec.getSelectedNotes().toString(), note, 'add note');

				// remove note
				nec.deleteNote();
				assert.equal(nec.getSelectedNotes().toString(), note, 'delete note');

				// Tie notes
				nec.setTie();
				assert.equal(nec.getSelectedNotes()[0].isTie(), false, 'tie note with only one selected');

				nec.cursor.setPos([0, 1]);
				nec.setTie();
				assert.equal(nec.getSelectedNotes()[0].isTie(), true, 'tie note');
				assert.equal(nec.getSelectedNotes()[0].isTie("start"), true, 'tie note begin type');
				assert.equal(nec.getSelectedNotes()[0].isTie("start_stop"), false, 'tie note type');
				assert.equal(nec.getSelectedNotes()[0].isTie("stop"), false, 'tie note type');

				assert.equal(nec.getSelectedNotes()[1].isTie("stop"), true, 'tie note end type');

				nec.setTie();
				assert.equal(nec.getSelectedNotes()[0].isTie(), false, 'remove tie begin note');
				assert.equal(nec.getSelectedNotes()[1].isTie(), false, 'remove tie end note');

				// Tuplets
				nec.setTuplet();
				assert.equal(nec.getSelectedNotes()[0].isTuplet(), false, 'tuplet with not 3 notes same length selected');
				assert.equal(nec.getSelectedNotes()[0].getTuplet(), undefined, 'type tuplet with not 3 notes same length selected');

				nec.cursor.setPos([3, 5]);
				nec.setTuplet();
				assert.equal(nec.getSelectedNotes()[0].isTuplet(), true, 'tuplet with 3 notes selected - first');
				assert.equal(nec.getSelectedNotes()[1].isTuplet(), true, 'tuplet with 3 notes selected - second');
				assert.equal(nec.getSelectedNotes()[2].isTuplet(), true, 'tuplet with 3 notes selected - third');

				assert.equal(nec.getSelectedNotes()[0].getTuplet(), "start", 'type tuplet with 3 notes selected - start');
				assert.equal(nec.getSelectedNotes()[1].getTuplet(), "middle", 'type tuplet with 3 notes selected - middle');
				assert.equal(nec.getSelectedNotes()[2].getTuplet(), "stop", 'type tuplet with 3 notes selected - stop');



				var selNotes = nec.getSelectedNotes().toString();
				nec.copyNotes();
				assert.equal(nec.buffer.toString(), selNotes, 'copy Notes');

				nec.cursor.setPos(5);
				nec.pasteNotes();
				nec.cursor.setPos([5, 7]);
				assert.equal(nec.getSelectedNotes().toString(), selNotes, 'copy Notes');

				assert.equal(nec.moveCursorByBar(-1), undefined);
				nec.moveCursorByBar(1);
				assert.equal(nec.getSelectedNotes().toString(), "G4");
				nec.moveCursorByBar(-1);
				assert.equal(nec.getSelectedNotes().toString(), "C5");
			});
		}
	};
});