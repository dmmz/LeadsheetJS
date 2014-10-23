define(['modules/core/src/SongModel', 'modules/converters/MidiCSL/src/SongConverterMidi_MidiCSL', 'modules/MidiCSLModel/src/SongModel_midiCSLModel', 'modules/MidiCSLModel/src/NoteModel_midiCSLModel', 'tests/test-songs', 'modules/converters/MusicCSLJson/src/SongModel_CSLJson'], 
	function(SongModel, SongConverterMidi_MidiCSL, SongModel_midiCSLModel, NoteModel_midiCSLModel, testSongs, SongModel_CSLJson) {
	return {
		run: function() {
			test("SongConverterMidi_MidiCSL", function(assert) {

				var msm = new SongModel_midiCSLModel();
				assert.deepEqual(msm.getSong(), []);

				// Create a song from testSong
				var songModel  = new SongModel();
				var song = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet, songModel);

				// Convert songmodel to a readable model that we can insert in SongModel_midiCSLModel
				var midiSong = SongConverterMidi_MidiCSL.exportToMidiCSL(songModel);

				var midiSongModel = new SongModel_midiCSLModel({'song': midiSong});

				var fakeSong = [];
				fakeSong.push(new NoteModel_midiCSLModel({currentTime:0, duration:8, midiNote:[69,73,76,80], type:'chord'}));
				fakeSong.push(new NoteModel_midiCSLModel({currentTime:8, duration:8, midiNote:[71,75,78,81], type:'chord'}));
				fakeSong.push(new NoteModel_midiCSLModel({currentTime:16, duration:8, midiNote:[64,67,71], type:'chord'}));
				fakeSong.push(new NoteModel_midiCSLModel({currentTime:24, duration:4, midiNote:[65,69,72,75], type:'chord'}));
				assert.deepEqual(midiSongModel.getSong(), fakeSong);
				

			});
		}
	}
});
