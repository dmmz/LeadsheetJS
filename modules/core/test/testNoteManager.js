define(['modules/core/src/NoteManager',
	'modules/core/src/NoteModel',
	'modules/core/src/SongModel',
	'modules/core/src/TimeSignatureModel',
	'utils/NoteUtils',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'tests/test-songs'
], function(NoteManager, NoteModel, SongModel, TimeSignature, NoteUtils, SongModel_CSLJson, testSongs) {
	return {
		run: function() {
			test("NoteManager", function(assert) {

				/**
				 * funciton to test a list of pitches
				 * @param  {NoteManagerModel} noteManager
				 * @param  {Assert} assert
				 * @param  {Array} pitchList   e.g ["E/4","F#/4"]
				 * @param  {Integer} posStart    index in noteManager.getNotes(), starting from 0
				 * @param  {Integer} posEnd      First index not wanted, e.g: posEnd 3, will return notes from 0 to 2
				 */
				function testPitchList(noteManager, assert, pitchList, posStart, posEnd) {
					var i = 0;
					noteManager.getNotes(posStart, posEnd).forEach(function(note) {
						assert.equal(note.getPitch(), pitchList[i]);
						i++;
					});
				}

				function managingMelodies(noteManager) {

					//melody ["E/4","F/4","G/4","A/4","B/4"]
					function createMelody(noteManager) {
						// insert notes in order
						noteManager.addNote(new NoteModel({
							pitchList: ["E/4"],
							duration: "q"
						}));

						noteManager.addNote(new NoteModel({
							pitchList: ["F/4"],
							duration: "8"
						}));
						noteManager.addNote(new NoteModel({
							pitchList: ["G/4"],
							duration: "8"
						}));
						noteManager.addNote(new NoteModel({
							pitchList: ["A/4"],
							duration: "8",
							dot: 1
						}));
						noteManager.addNote(new NoteModel({
							pitchList: ["B/4"],
							duration: "16"
						}));
					}

					createMelody(noteManager);
					assert.equal(noteManager.getTotal(), 5);
					assert.equal(noteManager.getTotalDuration(), 3);

					// "E/4","F/4","G/4","A/4","B/4"
					testPitchList(noteManager, assert, ["E/4", "F/4", "G/4", "A/4", "B/4"]);

					// insert in pos 0
					noteManager.addNote(new NoteModel({
						pitchList: ["C/5"],
						duration: "8"
					}), 0);
					// "C/5","E/4","F/4","G/4","A/4","B/4"
					testPitchList(noteManager, assert, ["C/5", "E/4", "F/4", "G/4", "A/4", "B/4"]);

					// insert in pos 1  
					noteManager.addNote(new NoteModel({
						pitchList: ["D/5"],
						duration: "8"
					}), 1);
					// "C/5","D/5","E/4","F/4","G/4","A/4","B/4"
					testPitchList(noteManager, assert, ["C/5", "D/5", "E/4"], 0, 3);


					assert.throws(function() {
						noteManager.deleteNote();
					}, 'Delete note');

					//undo both inserts
					noteManager.deleteNote(1);
					noteManager.deleteNote(0);

					// "E/4","F/4","G/4","A/4","B/4"
					testPitchList(noteManager, assert, ["E/4", "F/4", "G/4"], 0, 3);
					testPitchList(noteManager, assert, ["F/4", "G/4", "A/4"], 1, 4);

					var notesToPaste = [];
					notesToPaste.push(new NoteModel({
						pitchList: ["E/5"],
						duration: "q"
					}));
					notesToPaste.push(new NoteModel({
						pitchList: ["F/5"],
						duration: "q"
					}));
					// notesToPaste: "E/5","F/5" will replace note in pos 1 i.e. 2nd note ("F/4")
					noteManager.notesSplice([1, 1], notesToPaste);

					// "E/4","E/5","F/5","G/4","A/4","B/4"
					testPitchList(noteManager, assert, ["E/4", "E/5", "F/5", "G/4", "A/4", "B/4"]);

					// change notes from 3 to 6 (6 not included) with notesToPaste (note Gb/5)
					notesToPaste = [];
					notesToPaste.push(new NoteModel({
						pitchList: ["Gb/5"],
						duration: "q"
					}));
					noteManager.notesSplice([3, 6], notesToPaste);

					// "E/4","E/5","F/5","Gb/5"
					testPitchList(noteManager, assert, ["E/4", "E/5", "F/5", "Gb/5"]);

				}

				function durationFunctions(noteManager) {
					// rhythm  q,8,16,16, triplet(q,q,q)
					function createRhythmicMelody() {
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
						rhythmicMelody.push(new NoteModel({
							pitchList: ["D/3"],
							duration: "w"
						}));
						return rhythmicMelody;
					}
					noteManager.setNotes(createRhythmicMelody());
					assert.throws(function() {
						noteManager.getNoteBeat(8);
					}, 'Get Note beat');
					assert.equal(noteManager.getNoteBeat(0), 1);
					assert.equal(noteManager.getNoteBeat(1), 2);
					assert.equal(noteManager.getNoteBeat(2), 2.75);
					assert.equal(noteManager.getNoteBeat(3), 3);
					assert.equal(noteManager.getNoteBeat(4).toFixed(3), 3.667);
					assert.equal(noteManager.getNoteBeat(5).toFixed(3), 4.333);
					assert.equal(noteManager.getNoteBeat(6), 5);

					//getNextIndexNoteByBeat && getPrevIndexNoteByBeat
					assert.throws(function() {
						noteManager.getNextIndexNoteByBeat();
					});
					assert.throws(function() {
						noteManager.getNextIndexNoteByBeat(0);
					});
					assert.throws(function() {
						noteManager.getNextIndexNoteByBeat(0.5);
					});
					assert.equal(noteManager.getNextIndexNoteByBeat(1.8), 1);
					assert.equal(noteManager.getNextIndexNoteByBeat(3), 3);
					assert.equal(noteManager.getNextIndexNoteByBeat(3.1), 4);
					assert.equal(noteManager.getNextIndexNoteByBeat(4.9), 6);

					assert.equal(noteManager.getPrevIndexNoteByBeat(1.1), 0, "not exact prev");

					assert.equal(noteManager.getNextIndexNoteByBeat(15), undefined, "exceeds last beat");
					assert.equal(noteManager.getNextIndexNoteByBeat(10.1), undefined, 'getNextIndexNoteByBeat last beat must throw error'); //exceeds last beat

					assert.equal(noteManager.getNextIndexNoteByBeat(2), 1);
					assert.equal(noteManager.getPrevIndexNoteByBeat(2), 1, 'exact prev');
					assert.equal(noteManager.getPrevIndexNoteByBeat(2, true), 0, 'exact prev with ifExactExclude set to true'); //this is useful on tags
					assert.equal(noteManager.getPrevIndexNoteByBeat(2.2), 1);
					assert.equal(noteManager.getNextIndexNoteByBeat(2.2), 2);

					assert.deepEqual(noteManager.getBeatIntervalByIndexes(0, 2), [1, 3]);
					assert.deepEqual(noteManager.getBeatIntervalByIndexes(1, 5), [2, 5]);

					assert.deepEqual(noteManager.getIndexesStartingBetweenBeatInterval(1, 3.1), [0, 3]);
					assert.deepEqual(noteManager.getIndexesStartingBetweenBeatInterval(1, 10000000), [0, 8], 'if endBeat exceeds total duration, we get lastIndex + 1...');
					assert.deepEqual(noteManager.getIndexesStartingBetweenBeatInterval(1, 10000000, true), [0, 7], '...or lastIndex (7) ifExactExclude==true');
					assert.deepEqual(noteManager.getIndexesStartingBetweenBeatInterval(7, 7), [7, 7], 'both index within whole note');

					var newNote = new NoteModel({
						pitchList: ["A/5"],
						duration: "q",
						tuplet: "stop",
						timeModification: "3/2"
					});

					assert.equal(noteManager.getNoteBeat(0), 1);
					assert.equal(noteManager.getNoteBeat(1), 2);
					assert.equal(noteManager.getNoteBeat(2), 2.75);
					assert.equal(noteManager.getNoteBeat(3), 3);
					assert.equal(noteManager.getNoteBeat(4).toFixed(3), 3.667);
					assert.equal(noteManager.getNoteBeat(6), 5);
				}
				function scorePlayFunctions(testSongs){

					function createPlayingMelody(playingMelody){
						var note;
						var noteMng = new NoteManager();
						for (var i = 0; i < playingMelody.length; i++) {
							
							note = new NoteModel(playingMelody[i]);
							// we set ties manually because constructor from string does not support ties
							if (i == 15) 		note.setTie("start");
							else if(i == 16) 	note.setTie("stop_start");
							else if (i == 17) 	note.setTie("stop");
							noteMng.addNote(note);
						}
						return noteMng;
					}

					var song = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.keySigChanges);
					// with this notes from testSongs.keySigChanges, all if cases on play2song and song2play methods are covered (we have checked it)
					// keySig F 
					// bars:  			 (0) F/4-w |
					// 		   keySig:D  (1)Fn/4-8  (2)F/4-8  (3)F/5-8  (4)C/4-8  (5)Cb/4-8  (6)C/4-16 (7)16r   (8)A/4-16  (9)A#/4-16 (10)F/4-16 (11)A/4-16 |
					// 		   keySig:G  (12)F/4-q  (13)C/4-q (14)D#/4-8 (15)Dn/4-8  (16)D/4-8  (17)Bb/4-8-tied | 
					// 		   			 (18)B/4-w-tied |
					// 		   			 (19)B/4-h  (20)B/4-h
					// 		    		  
					var noteMng = song.getComponent('notes'); 
					var scoreMelody = [	"F/4-w", 
										"Fn/4-8", "F/4-8", "F/5-8", "C/4-8", "Cb/4-8", "C/4-16", "16r", "A/4-16", "A#/4-16", "F/4-16", "A/4-16", 
										"F/4-q",  "C/4-q", "D#/4-8", "Dn/4-8", "D/4-8", "Bb/4-8", 
										"B/4-w", 
										"B/4-h", "B/4-h" ];
					var playingMelody = [	/* first bar has one note but it hasn't been selected (start is 2) */
											/* second bar first note not selected neither,  */ "F/4-8","F#/5-8","C#/4-8","Cb/4-8","Cb/4-16","16r","A/4-16","A#/4-16","F/4-16","A#/4-16", 
										 "F#/4-q","C/4-q","D#/4-8","D/4-8","D/4-8","Bb/4-8",
										 "Bb/4-w",
										 "Bb/4-h", "B/4-h"];
					var start = 2, end = 21;
					assert.deepEqual(noteMng.score2play(song, start, end).getNotesAsString(), playingMelody, 'score2play');
					//we replace noteMng with playing notes
					var playNotes = createPlayingMelody(playingMelody);
					noteMng.notesSplice([start, end],playNotes.getNotes());
					assert.deepEqual(noteMng.play2score(song, start, end).getNotesAsString(), scoreMelody.slice(start, end),'play2score');
				}

				function otherFunctions(testSongs) {
					var song = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet, new SongModel());
					var noteMng = song.getComponent("notes");
					var notes = noteMng.getNotesAtBarNumber(3, song);
					// returned notes
					// [
					//	{ keys: ["a/4"], duration: "q" },
					//	{ keys: ["f/4"], duration: "q" },
					//	{ keys: ["g/4"], duration: "q" },
					//	{ keys: ["e/4"], duration: "q" }
					// ]
					assert.equal(notes[0].getPitch(), "A/4");
					assert.equal(notes[1].getPitch(), "F/4");
					assert.equal(notes[2].getPitch(), "G/4");
					assert.equal(notes[3].getPitch(), "E/4");

					assert.equal(noteMng.getNoteBarNumber(0, song), 0, 'getNoteBarNumber');
					assert.equal(noteMng.getNoteBarNumber(1, song), 0);
					assert.equal(noteMng.getNoteBarNumber(2, song), 0);
					assert.equal(noteMng.getNoteBarNumber(3, song), 0);
					assert.equal(noteMng.getNoteBarNumber(4, song), 0);
					assert.equal(noteMng.getNoteBarNumber(5, song), 1);
					assert.equal(noteMng.getNoteBarNumber(6, song), 1);
					assert.equal(noteMng.getNoteBarNumber(7, song), 1);
					assert.equal(noteMng.getNoteBarNumber(8, song), 1);
					assert.equal(noteMng.getNoteBarNumber(9, song), 2);
					assert.equal(noteMng.getNoteBarNumber(10, song), 2);
					assert.equal(noteMng.getNotesBetweenBarNumbers(0, 1, song), 'A/4-q,G/4-8,E/4-8,F/4-q,C/4-q,A/4-q,F/4-q,G/4-q,E/4-q', 'notes on two first bars');
					assert.equal(noteMng.getNotesBetweenBarNumbers(6, 7, song), 'A/4-q,F/4-q,G/4-q,E/4-q,A/4-q,F/4-q,G/4-q,E/4-q', 'notes on two last bars');
				}

				function timeSignatureChanges() {
					// rhythm  q,8,16,16, triplet(q,q,q)
					function createSilencesMelody() {
						var silencesMelody = [];
						silencesMelody.push(new NoteModel('wr'));
						silencesMelody.push(new NoteModel('wr'));
						return silencesMelody;
					}
					/**
					 * creates a melody with ony only figure
					 * @param  {String} figure ex: 'h','q','8','16'...etc.
					 * @param  {Number} number how many figures
					 * @return {Array}        of NoteModels
					 */
					function createSimpleRhythm(figure, number) {
						var simpleRhythm = [];
						for (var i = 0; i < number; i++) {
							simpleRhythm.push(new NoteModel('A/4-' + figure));
						}
						return simpleRhythm;

					}
					noteManager.setNotes(createSilencesMelody());
					var notes;
					notes = noteManager.getNotesAdaptedToTimeSig(new TimeSignature('6/8'), 2);
					assert.equal(notes.toString(), 'h.r,h.r', 'getNotesAdaptedToTimeSig for only silences'); //it seems not to be necessary toString, (useful to put if test fails)

					notes = noteManager.getNotesAdaptedToTimeSig(new TimeSignature('3/8'), 3);
					assert.equal(notes.toString(), 'q.r,q.r,q.r');

					noteManager.setNotes(createSimpleRhythm('q', 4)); //A/4-q, A/4-q, A/4-q, A/4-q
					notes = noteManager.getNotesAdaptedToTimeSig(new TimeSignature('3/4'));
					assert.equal(notes.toString(), 'A/4-q,A/4-q,A/4-q,A/4-q,hr', 'getNotesAdaptedToTimeSig for notes');

					noteManager.setNotes(createSimpleRhythm('8', 5));
					notes = noteManager.getNotesAdaptedToTimeSig(new TimeSignature('3/8'));
					assert.equal(notes.toString(), 'A/4-8,A/4-8,A/4-8,A/4-8,A/4-8,8r');

					noteManager.setNotes(createSimpleRhythm('8', 9));
					notes = noteManager.getNotesAdaptedToTimeSig(new TimeSignature('2/2'));
					assert.equal(notes.toString(), 'A/4-8,A/4-8,A/4-8,A/4-8,A/4-8,A/4-8,A/4-8,A/4-8,A/4-8,h..r');

					//breaking notes notes
					noteManager.setNotes(createSimpleRhythm('q', 4));
					notes = noteManager.getNotesAdaptedToTimeSig(new TimeSignature('3/8'));

					//tuplets

					//assert.equal(notes,'qr,qr,qr,qr,qr,qr');

				}

				function testDurationToNotes() {

					assert.equal(NoteUtils.durationToNotes(2).toString(), 'h', 'simple notes');
					assert.equal(NoteUtils.durationToNotes(4).toString(), 'w');
					assert.equal(NoteUtils.durationToNotes(0.5).toString(), '8');
					assert.equal(NoteUtils.durationToNotes(1).toString(), 'q');
					assert.equal(NoteUtils.durationToNotes(0.25).toString(), '16');
					assert.equal(NoteUtils.durationToNotes(0.125).toString(), '32');
					assert.equal(NoteUtils.durationToNotes(0.0625).toString(), '64');

					assert.equal(NoteUtils.durationToNotes(5.25).toString(), '16,q,w', 'cannot merge as it is never a dot of previous');
					assert.equal(NoteUtils.durationToNotes(8).toString(), 'w,w');
					assert.equal(NoteUtils.durationToNotes(4.5).toString(), '8,w');
					assert.equal(NoteUtils.durationToNotes(1.25).toString(), '16,q');
					assert.equal(NoteUtils.durationToNotes(0.625).toString(), '32,8');
					assert.equal(NoteUtils.durationToNotes(2.5).toString(), '8,h');
					assert.equal(NoteUtils.durationToNotes(2.25).toString(), '16,h');
					assert.equal(NoteUtils.durationToNotes(2.125).toString(), '32,h');

					assert.equal(NoteUtils.durationToNotes(7).toString(), 'w..', 'double merged');
					assert.equal(NoteUtils.durationToNotes(3.5).toString(), 'h..');
					assert.equal(NoteUtils.durationToNotes(1.75).toString(), 'q..');
					assert.equal(NoteUtils.durationToNotes(0.875).toString(), '8..');

					assert.equal(NoteUtils.durationToNotes(6).toString(), 'w.');
					assert.equal(NoteUtils.durationToNotes(3).toString(), 'h.');
					assert.equal(NoteUtils.durationToNotes(1.5).toString(), 'q.');
					assert.equal(NoteUtils.durationToNotes(0.75).toString(), '8.');
					assert.equal(NoteUtils.durationToNotes(0.375).toString(), '16.');
					assert.equal(NoteUtils.durationToNotes(0.1875).toString(), '32.');

					assert.equal(NoteUtils.durationToNotes(5.5).toString(), 'q.,w', 'merged to q. but cannot merge w');
					assert.equal(NoteUtils.durationToNotes(7.5).toString(), 'h..,w', 'could merge everything but maximum dot is 2');
					assert.equal(NoteUtils.durationToNotes(5.75).toString(), 'q..,w', 'other complex cases');
					assert.equal(NoteUtils.durationToNotes(3.75).toString(), 'q..,h');
					assert.equal(NoteUtils.durationToNotes(3.25).toString(), '16,h.');
					assert.equal(NoteUtils.durationToNotes(2.75).toString(), '8.,h');
					assert.equal(NoteUtils.durationToNotes(2.375).toString(), '16.,h');
					assert.equal(NoteUtils.durationToNotes(1.875).toString(), '8..,q');
					assert.equal(NoteUtils.durationToNotes(1.825).toString(), '64,q..');
					assert.equal(NoteUtils.durationToNotes(1.625).toString(), '32,q.');

				}

				function findRestAreas(noteMng) {
					function createMelodyWithRests() {
						var melody = [];
						//bar1
						melody.push(new NoteModel('qr'));
						melody.push(new NoteModel('8.r'));
						melody.push(new NoteModel('16r'));
						melody.push(new NoteModel('qr'));
						melody.push(new NoteModel('qr'));
						//bar2
						melody.push(new NoteModel('C/4-q'));
						melody.push(new NoteModel('qr'));
						melody.push(new NoteModel('qr'));
						melody.push(new NoteModel('qr'));
						return melody;
					}
					noteMng.setNotes(createMelodyWithRests());

					assert.deepEqual(noteMng.findRestAreas([5, 5]), [
						[0, 4],
						[6, 8]
					], 'expands to outerLeft and outerRight');

					assert.deepEqual(noteMng.findRestAreas([0, 4]), [
						[0, 4]
					], 'expands to innerLeft');

					assert.deepEqual(noteMng.findRestAreas([5, 6]), [
						[0, 4],
						[6, 8]
					], 'expands to outers and innerRight');

					assert.deepEqual(noteMng.findRestAreas([3, 6]), [
						[0, 4],
						[6, 8]
					], 'expands to inners and outers');

				}

				var noteManager = new NoteManager();

				managingMelodies(noteManager);
				durationFunctions(noteManager);
				otherFunctions(testSongs);
				timeSignatureChanges();
				testDurationToNotes(testSongs);
				findRestAreas(noteManager);
				scorePlayFunctions(testSongs);

			});

		}
	};
});