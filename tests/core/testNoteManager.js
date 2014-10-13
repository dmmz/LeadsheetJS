define(['modules/core/NoteManager', 'modules/core/NoteModel'], function(NoteManager, NoteModel) {
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

				var noteManager = new NoteManager();

				// insert notes in order
				noteManager.addNote(new NoteModel({
					keys: ["E/4"],
					duration: "q"
				}));

				noteManager.addNote(new NoteModel({
					keys: ["F/4"],
					duration: "8"
				}));
				noteManager.addNote(new NoteModel({
					keys: ["G/4"],
					duration: "8"
				}));
				noteManager.addNote(new NoteModel({
					keys: ["A/4"],
					duration: "8",
					dot: 1
				}));
				noteManager.addNote(new NoteModel({
					keys: ["B/4"],
					duration: "16"
				}));
				assert.equal(noteManager.getTotal(), 5);
				assert.equal(noteManager.getTotalDuration(), 3);

				// "E/4","F/4","G/4","A/4","B/4"
				testPitchList(noteManager, assert, ["E/4", "F/4", "G/4", "A/4", "B/4"]);

				// insert in pos 0
				noteManager.addNote(new NoteModel({
					keys: ["C/5"],
					duration: "8"
				}), 0);
				// "C/5","E/4","F/4","G/4","A/4","B/4"
				testPitchList(noteManager, assert, ["C/5", "E/4", "F/4", "G/4", "A/4", "B/4"]);

				// insert in pos 1  
				noteManager.addNote(new NoteModel({
					keys: ["D/5"],
					duration: "8"
				}), 1);
				// "C/5","D/5","E/4","F/4","G/4","A/4","B/4"
				testPitchList(noteManager, assert, ["C/5", "D/5", "E/4"], 0, 3);


				assert.throws(function() {
					noteManager.deleteNote();
				});

				//undo both inserts
				noteManager.deleteNote(1);
				noteManager.deleteNote(0);

				// "E/4","F/4","G/4","A/4","B/4"
				testPitchList(noteManager, assert, ["E/4", "F/4", "G/4"], 0, 3);
				testPitchList(noteManager, assert, ["F/4", "G/4", "A/4"], 1, 4);

				var notesToPaste = [];
				notesToPaste.push(new NoteModel({
					keys: ["E/5"],
					duration: "q"
				}));
				notesToPaste.push(new NoteModel({
					keys: ["F/5"],
					duration: "q"
				}));
				// notesToPaste: "E/5","F/5" will replace note in pos 1 i.e. 2nd note ("F/4")
				noteManager.notesSplice([1, 1], notesToPaste);

				// "E/4","E/5","F/5","G/4","A/4","B/4"
				testPitchList(noteManager, assert, ["E/4", "E/5", "F/5", "G/4", "A/4", "B/4"]);

				// change notes from 3 to 6 (6 not included) with notesToPaste (note Gb/5)
				notesToPaste = [];
				notesToPaste.push(new NoteModel({
					keys: ["Gb/5"],
					duration: "q"
				}));
				noteManager.notesSplice([3, 6], notesToPaste);

				// "E/4","E/5","F/5","Gb/5"
				testPitchList(noteManager, assert, ["E/4", "E/5", "F/5", "Gb/5"]);

				// To test setNotes and functions related to beat we'll use a new melody
				var rhythmicMelody = [];
				rhythmicMelody.push(new NoteModel({
					keys: ["F#/5"],
					duration: "q"
				}));
				rhythmicMelody.push(new NoteModel({
					keys: ["G/5"],
					duration: "8",
					dot: 1
				}));
				rhythmicMelody.push(new NoteModel({
					keys: ["F#/5"],
					duration: "16"
				}));

				rhythmicMelody.push(new NoteModel({
					keys: ["F#/5"],
					duration: "q",
					tuplet: "start",
					time_modification: "3/2"
				}));
				rhythmicMelody.push(new NoteModel({
					keys: ["G/5"],
					duration: "q",
					time_modification: "3/2"
				}));
				rhythmicMelody.push(new NoteModel({
					keys: ["A/5"],
					duration: "q",
					tuplet: "stop",
					time_modification: "3/2"
				}));
				rhythmicMelody.push(new NoteModel({
					keys: ["Bb/5"],
					duration: "q"
				}));
				
				// rhythm  q,8,16,16, triplet(q,q,q)
				noteManager.setNotes(rhythmicMelody);
				assert.throws(function(){
					noteManager.getNoteBeat(7)
				});
				assert.equal(noteManager.getNoteBeat(0),1);
				assert.equal(noteManager.getNoteBeat(1),2);
				assert.equal(noteManager.getNoteBeat(2),2.75);
				assert.equal(noteManager.getNoteBeat(3),3);
				assert.equal(noteManager.getNoteBeat(4).toFixed(3),3.667);
				assert.equal(noteManager.getNoteBeat(6),5);
				
				assert.deepEqual(noteManager.getBeatIntervalByIndexes(0,2),[1,3]);
				assert.deepEqual(noteManager.getBeatIntervalByIndexes(1,5),[2,5]);
				
				assert.throws(function(){
					noteManager.getNextIndexNoteByBeat();
				});
				assert.throws(function(){
					noteManager.getNextIndexNoteByBeat(0);
				});
				assert.throws(function(){
					noteManager.getNextIndexNoteByBeat(0.5);
				});
				assert.equal(noteManager.getNextIndexNoteByBeat(1.8),1);
				assert.equal(noteManager.getNextIndexNoteByBeat(3),3);
				assert.equal(noteManager.getNextIndexNoteByBeat(3.1),4);
				assert.equal(noteManager.getNextIndexNoteByBeat(4.9),6);

				assert.equal(noteManager.getPrevIndexNoteByBeat(1.1),0);
				assert.throws(function(){
					noteManager.getNextIndexNoteByBeat(10);	//exceeds last beat
				});
				assert.throws(function(){
					noteManager.getNextIndexNoteByBeat(6.1);	//exceeds last beat
				});
				assert.equal(noteManager.getPrevIndexNoteByBeat(6),6);
				
				assert.deepEqual(noteManager.getIndexesStartingBetweenBeatInterval(1,3.1),[0,3]);

				var newNote = new NoteModel({
					keys: ["A/5"],
					duration: "q",
					tuplet: "stop",
					time_modification: "3/2"
				});
				
				assert.equal(noteManager.getNoteIndex(newNote),5);

				// rhythm  q,8,16,16, triplet(q,q,q)
				noteManager.setNotes(rhythmicMelody);

				assert.equal(noteManager.getNoteBeat(0), 1);
				assert.equal(noteManager.getNoteBeat(1), 2);
				assert.equal(noteManager.getNoteBeat(2), 2.75);
				assert.equal(noteManager.getNoteBeat(3), 3);
				assert.equal(noteManager.getNoteBeat(4).toFixed(3), 3.667);
				assert.equal(noteManager.getNoteBeat(6), 5);






			});

		}
	};
});