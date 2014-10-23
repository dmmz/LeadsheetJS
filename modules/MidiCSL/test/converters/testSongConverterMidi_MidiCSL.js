define(['modules/core/src/SongModel', 'modules/MidiCSL/src/converters/SongConverterMidi_MidiCSL', 'modules/MidiCSL/src/model/SongModel_midiCSL', 'modules/MidiCSL/src/model/NoteModel_midiCSL', 'tests/test-songs', 'modules/converters/MusicCSLJson/src/SongModel_CSLJson'], 
	function(SongModel, SongConverterMidi_MidiCSL, SongModel_midiCSL, NoteModel_midiCSL, testSongs, SongModel_CSLJson) {
	return {
		run: function() {
			test("SongConverterMidi_MidiCSL", function(assert) {

				var msm = new SongModel_midiCSL();
				assert.deepEqual(msm.getSong(), []);

				
				// Create a song from testSong
				var songModel  = new SongModel();
				var song = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet, songModel);

				// Convert songmodel to a readable model that we can insert in SongModel_midiCSL
				var midiSong = SongConverterMidi_MidiCSL.exportToMidiCSL(songModel);

				var midiSongModel = new SongModel_midiCSL({'song': midiSong});

				var fakeSong = [];
				fakeSong.push(new NoteModel_midiCSL({currentTime:0, duration:8, midiNote:[69,73,76,80], type:'chord'}));
				fakeSong.push(new NoteModel_midiCSL({currentTime:8, duration:8, midiNote:[71,75,78,81], type:'chord'}));
				fakeSong.push(new NoteModel_midiCSL({currentTime:16, duration:8, midiNote:[64,67,71], type:'chord'}));
				fakeSong.push(new NoteModel_midiCSL({currentTime:24, duration:4, midiNote:[65,69,72,75], type:'chord'}));
				assert.deepEqual(midiSongModel.getSong(), fakeSong);

			});
		}
	}
});
