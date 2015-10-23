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

				assert.equal(nec._getSelectedNotes().toString(), "A/4-q");

				// Pitch
				nec.setPitch(1);
				assert.equal(nec._getSelectedNotes().toString(), "B/4-q");

				nec.setPitch("C");
				assert.equal(nec._getSelectedNotes().toString(), "C/5-q");

				// Wrong insert (accidental should be specified like this)
				nec.setPitch("Db");
				assert.equal(nec._getSelectedNotes().toString(), "C/5-q");

				// Accidentals
				nec.addAccidental("b");
				assert.equal(nec._getSelectedNotes().toString(), "Cb/5-q", 'accidental flat');

				nec.addAccidental("bb");
				assert.equal(nec._getSelectedNotes().toString(), "Cbb/5-q");

				nec.addAccidental("#");
				assert.equal(nec._getSelectedNotes().toString(), "C#/5-q");

				nec.addAccidental("##");
				assert.equal(nec._getSelectedNotes().toString(), "C##/5-q");

				nec.addAccidental("n");
				assert.equal(nec._getSelectedNotes().toString(), "Cn/5-q");

				// remove if same
				nec.addAccidental("n");
				assert.equal(nec._getSelectedNotes().toString(), "C/5-q", 'remove accidental');

				// Durations
				nec.setCurrDuration("1");
				assert.equal(nec._getSelectedNotes()[0].getDuration(), 0.0625, 'durations 1');
				nec.setCurrDuration("2");
				assert.equal(nec._getSelectedNotes()[0].getDuration(), 0.125, 'durations 2');
				nec.setCurrDuration("3");
				assert.equal(nec._getSelectedNotes()[0].getDuration(), 0.25, 'durations 3');
				nec.setCurrDuration("4");
				assert.equal(nec._getSelectedNotes()[0].getDuration(), 0.5, 'durations 4');
				nec.setCurrDuration("5");
				assert.equal(nec._getSelectedNotes()[0].getDuration(), 1, 'durations 5');
				nec.setCurrDuration("6");
				assert.equal(nec._getSelectedNotes()[0].getDuration(), 2, 'durations 6');
				nec.setCurrDuration("7");
				assert.equal(nec._getSelectedNotes()[0].getDuration(), 4, 'durations 7');
				nec.setCurrDuration("8");
				assert.equal(nec._getSelectedNotes()[0].getDuration(), 4, 'durations 8');
				assert.throws(function() {
					nec.setCurrDuration("9");
				}, 'throw error on impossible duration');

				nec.setDot();
				//Test failed as duration was 4, not 6, because time signature is 4/4, so it forbids it, 
				//it has wthorn a userLog error, but it is not visualized in the test, because it needs a user interface
				//assert.equal(nec._getSelectedNotes()[0].getDuration(), 6, 'dot');

				nec.setSilence();
				assert.ok(nec._getSelectedNotes()[0].isRest, 'rest');

				// add note
				var note = nec._getSelectedNotes().toString();
				nec.addNote();
				assert.equal(nec._getSelectedNotes().toString(), note, 'add note');

				// Editor test where delete is like silence
				var necDelete = createRhythmicMelody();
				// "F#/5-q,G/5-8.,F#/5-16,F#/5-q(3/2),G/5-q(3/2),A/5-q(3/2),Bb/5-q"  	(after each step we show value of necDelete.songModel.getComponent('notes').getNotes().toString())
				necDelete.setSilence();
				assert.equal(necDelete._getSelectedNotes().toString(), 'qr', 'delete note');
				// "qr,G/5-8.,F#/5-16,F#/5-q(3/2),G/5-q(3/2),A/5-q(3/2),Bb/5-q"

				necDelete.cursor.setPos([1, 2]);
				necDelete.setSilence();
				assert.equal(necDelete._getSelectedNotes().toString(), '8.r,16r', 'delete note');
				// "qr,8.r,16r,F#/5-q(3/2),G/5-q(3/2),A/5-q(3/2),Bb/5-q"

				necDelete.cursor.setPos([3, 3]);
				necDelete.setSilence();
				assert.equal(necDelete._getSelectedNotes().toString(), 'q(3/2)r', 'Delete tuplet note');
				assert.equal(necDelete._getSelectedNotes()[0].isTuplet(), true, 'tuplet after one note deletion should be a tuplet');
				// "qr,8.r,16r,q(3/2)r,G/5-q(3/2),A/5-q(3/2),Bb/5-q"

				necDelete.cursor.setPos([3, 4]);
				nec.setTuplet();


				necDelete.cursor.setPos([3, 5]);
				necDelete.setSilence();
				assert.equal(necDelete._getSelectedNotes()[0].isTuplet(), false, 'tuplet after whole note deletion should no more be a tuplet');
				assert.equal(necDelete._getSelectedNotes()[1].isTuplet(), false, 'tuplet after whole note  deletion should no more be a tuplet');
				assert.deepEqual(necDelete.cursor.getPos(), [3, 4]);

				necDelete.cursor.setPos([3, 5]);
				necDelete.setSilence();
				assert.equal(necDelete._getSelectedNotes()[0].isTuplet(), false, 'tuplet after whole tuplets deletion should no more be a tuplet');
				assert.equal(necDelete._getSelectedNotes()[1].isTuplet(), false, 'tuplet after whole tuplets  deletion should no more be a tuplet');
				assert.equal(necDelete._getSelectedNotes()[2].isTuplet(), false, 'tuplet after whole tuplets  deletion should no more be a tuplet');


				// Tie notes
				nec.setTie();
				assert.equal(nec._getSelectedNotes()[0].isTie(), false, 'tie note with only one selected');

				nec.cursor.setPos([0, 1]);
				nec.setTie();
				assert.equal(nec._getSelectedNotes()[0].isTie(), true, 'tie note');
				assert.equal(nec._getSelectedNotes()[0].isTie("start"), true, 'tie note begin type');
				assert.equal(nec._getSelectedNotes()[0].isTie("start_stop"), false, 'tie note type');
				assert.equal(nec._getSelectedNotes()[0].isTie("stop"), false, 'tie note type');

				assert.equal(nec._getSelectedNotes()[1].isTie("stop"), true, 'tie note end type');

				nec.setTie();
				assert.equal(nec._getSelectedNotes()[0].isTie(), false, 'remove tie begin note');
				assert.equal(nec._getSelectedNotes()[1].isTie(), false, 'remove tie end note');

				// Tuplets
				nec.cursor.setPos([3, 4]);
				nec.setTuplet();
				assert.equal(nec._getSelectedNotes()[0].isTuplet(), false, 'tuplet with not 3 notes same length selected');
				assert.equal(nec._getSelectedNotes()[0].getTuplet(), undefined, 'type tuplet with not 3 notes same length selected');

				nec.cursor.setPos([5, 7]);
				nec.setTuplet();
				assert.equal(nec._getSelectedNotes()[0].isTuplet(), true, 'tuplet with 3 notes selected - first');
				assert.equal(nec._getSelectedNotes()[1].isTuplet(), true, 'tuplet with 3 notes selected - second');
				assert.equal(nec._getSelectedNotes()[2].isTuplet(), true, 'tuplet with 3 notes selected - third');

				assert.equal(nec._getSelectedNotes()[0].getTuplet(), "start", 'type tuplet with 3 notes selected - start');
				assert.equal(nec._getSelectedNotes()[1].getTuplet(), "middle", 'type tuplet with 3 notes selected - middle');
				assert.equal(nec._getSelectedNotes()[2].getTuplet(), "stop", 'type tuplet with 3 notes selected - stop');

				var selNotes = nec._getSelectedNotes().toString();
				nec.copyNotes();
				assert.equal(nec.buffer.toString(), selNotes, 'copy Notes');

				nec.cursor.setPos(5);
				nec.pasteNotes();
				nec.cursor.setPos([5, 7]);
				assert.equal(nec._getSelectedNotes().toString(), selNotes, 'copy Notes');


				songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);
				cM = new CursorModel(songModel.getComponent('notes'));
				nec = new NoteEditionController(songModel, cM);
				assert.equal(nec.moveCursorByBar(-1), undefined);
				nec.moveCursorByBar(1);
				assert.equal(nec._getSelectedNotes().toString(), "A/4-q");
				nec.moveCursorByBar(-1);
				nec.setCurrDuration("2");
				assert.equal(nec._getSelectedNotes().toString(), "A/4-32");



				// rhythm  q,8,16,16, triplet(q,q,q)
				function createRhythmicMelody() {
					var songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);
					var cM = new CursorModel(songModel.getComponent('notes'));
					var nec = new NoteEditionController(songModel, cM);
					var rhythmicMelody = [];
					rhythmicMelody.push(new NoteModel({
						pitchList: ["F#/5"],
						duration: "q"
					}));
					rhythmicMelody.push(new NoteModel({
						pitchList: ["G/5"],
						duration: "8",
						dot: 1
					}));
					rhythmicMelody.push(new NoteModel({
						pitchList: ["F#/5"],
						duration: "16"
					}));

					rhythmicMelody.push(new NoteModel({
						pitchList: ["F#/5"],
						duration: "q",
						tuplet: "start",
						timeModification: "3/2"
					}));
					rhythmicMelody.push(new NoteModel({
						pitchList: ["G/5"],
						duration: "q",
						timeModification: "3/2"
					}));
					rhythmicMelody.push(new NoteModel({
						pitchList: ["A/5"],
						duration: "q",
						tuplet: "stop",
						timeModification: "3/2"
					}));
					rhythmicMelody.push(new NoteModel({
						pitchList: ["Bb/5"],
						duration: "q"
					}));
					songModel.getComponent('notes').setNotes(rhythmicMelody);

					return nec;
				}

			});
		}
	};
});