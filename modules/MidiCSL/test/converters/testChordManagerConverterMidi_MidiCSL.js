define([
	'modules/core/src/SongModel', 
	'modules/MidiCSL/src/converters/ChordManagerConverterMidi_MidiCSL', 
	'modules/MidiCSL/src/model/SongModel_midiCSL', 'modules/MidiCSL/src/model/NoteModel_midiCSL', 
	'tests/test-songs', 
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson'],
	function(SongModel, ChordManagerConverterMidi_MidiCSL, SongModel_midiCSL, NoteModel_midiCSL, testSongs, SongModel_CSLJson) {
	return {
		run: function() {
			test("ChordManagerConverterMidi_MidiCSL", function(assert) {

				var msm = new SongModel_midiCSL();
				

				// Create a song from testSong
				
			/*	var midiSong = ChordManagerConverterMidi_MidiCSL.exportToMidiCSL(
					SongModel_CSLJson.importFromMusicCSLJSON(
						{
							title: "song",
							time: "4/4",
							changes: [{
								id: 0,
								name: "A",
								bars: [{
									chords: [{
										p: "A",
										ch: "M7",
										beat: 1
									}]
								}]

							}]
						}
					)
				);
				assert.equal(midiSong[0].currentTime, 0, 'song with one chord');
				assert.equal(midiSong[0].duration, 4);

				midiSong = ChordManagerConverterMidi_MidiCSL.exportToMidiCSL(
					SongModel_CSLJson.importFromMusicCSLJSON(
						{
							title: "song",
							time: "4/4",
							changes: [{
								id: 0,
								name: "A",
								bars: [{
									melody:[{
										keys: ["a/4"],
										duration: "q"
									}]
								}]
							}]
						}
					)
				);*/
				
				var midiSong = ChordManagerConverterMidi_MidiCSL.exportToMidiCSL(
					SongModel_CSLJson.importFromMusicCSLJSON(
						{
							title: "song",
							time: "4/4",
							changes: [{
								id: 0,
								name: "A",
								bars: [
									//bar 0
									//currentTime 0
									{
										melody:[{
											keys: ["a/4"],
											duration: "w"
										}]
									},
									//bar 1
									//currentTime 4
									{
										melody:[{
											keys: ["g/4"],
											duration: "w"
										}]
									},{
										//bar 2
										//currentTime 8
										//chord 0
										chords: [{
											p: "F",
											ch: "m7",
											beat: 1
										}],
										melody:[{
											keys: ["a/4"],
											duration: "w"
										}]
									},{
										//bar 3
										//currentTime 12
										//chord 1
										chords: [{
											p: "A",
											ch: "m7",
											beat: 1
										}],
										melody:[{
											keys: ["b/4"],
											duration: "w"
										}]
									},{
										//bar 4
										//currentTime 16
										chords: [{
											p: "A",
											ch: "m7",
											beat: 3
										}],
										melody:[{
											keys: ["b/4"],
											duration: "w"
										}]
									},{
										//bar 5
										//currentTime 20
										melody:[{
											keys: ["b/4"],
											duration: "w"
										}]
									}

								],
							}]
						}
					)
				);

				assert.equal(midiSong[0].currentTime, 8, 'song with first chord in second bar');
				assert.equal(midiSong[1].currentTime, 12, 'second chord is in 3rd bar');
				assert.equal(midiSong[2].currentTime, 18, 'song with first chord in second bar');
				assert.equal(midiSong[3].currentTime, 20);


				
			


			// 	var done = assert.async();
			// 	// Convert songmodel to a readable model that we can insert in SongModel_midiCSL
			// 	ChordManagerConverterMidi_MidiCSL.exportToMidiCSL(songModel, false, function(midiSong) {
			// 		var midiSongModel = new SongModel_midiCSL({'song': midiSong});

			// 		var fakeSong = [];
			// 		fakeSong.push(new NoteModel_midiCSL({currentTime:0, duration:4, midiNote:[69,73,76,80], type:'chord'}));
			// 		fakeSong.push(new NoteModel_midiCSL({currentTime:4, duration:4, midiNote:[69,73,76,80], type:'chord'}));
			// 		fakeSong.push(new NoteModel_midiCSL({currentTime:8, duration:4, midiNote:[71,75,78,81], type:'chord'}));
			// 		fakeSong.push(new NoteModel_midiCSL({currentTime:12, duration:4, midiNote:[71,75,78,81], type:'chord'}));
			// 		fakeSong.push(new NoteModel_midiCSL({currentTime:16, duration:4, midiNote:[64,67,71], type:'chord'}));
			// 		fakeSong.push(new NoteModel_midiCSL({currentTime:20, duration:4, midiNote:[64,67,71], type:'chord'}));
			// 		fakeSong.push(new NoteModel_midiCSL({currentTime:24, duration:4, midiNote:[65,69,72,75], type:'chord'}));
			// 		fakeSong.push(new NoteModel_midiCSL({currentTime:28, duration:4, midiNote:[65,69,72,75], type:'chord'}));
			// 		assert.deepEqual(midiSongModel.getFromType('chord'), fakeSong);

			// 		var fakeNote = new NoteModel_midiCSL({currentTime:0, duration:1, midiNote:[69], type:'melody', 'noteIndex':0});
			// 		assert.deepEqual(midiSongModel.getFromType('melody')[0], fakeNote);

			// 		fakeNote = new NoteModel_midiCSL({currentTime:7, duration:1, midiNote:[64], type:'melody', 'noteIndex':8});
			// 		assert.deepEqual(midiSongModel.getFromType('melody')[8], fakeNote);

			// 		fakeNote = new NoteModel_midiCSL({currentTime:2, duration:1, midiNote:[65], type:'melody', 'noteIndex':3});
			// 		assert.deepEqual(midiSongModel.getMelodySoundModelFromIndex(3), fakeNote, 'getmidiSongModel melody from index');
			// 		done();
			// 	});
			});
		}
	};
});

