define(['modules/midiSoundModel/src/MidiSongModel_midiSoundModel', 'modules/midiSoundModel/src/MidiNoteModel_midiSoundModel'], 
	function(MidiSongModel, MidiNoteModel) {
	return {
		run: function() {
			test("MidiSongModel_midiSoundModel", function(assert) {
				var msm = new MidiSongModel();
				assert.deepEqual(msm.getSong(), []);

				var n1 = new MidiNoteModel({'currentTime': 0, 'duration': 1, 'midiNote': [45], 'type': 'melody'});
				var n2 = new MidiNoteModel({'currentTime': 1, 'duration': 1, 'midiNote': [60], 'type': 'melody'});
				var c1 = new MidiNoteModel({'currentTime': 0, 'duration': 1, 'midiNote': [60,65,67], 'type': 'chords'});
				
				var msm = new MidiSongModel({song:[n1,n2,c1]});

				var msm2 = new MidiSongModel();

				msm2.setSong([n1, n2, c1]);

				assert.deepEqual(msm.getSong(), msm2.getSong(), 'Set and getSong');

				// testing get from types
				assert.deepEqual(msm.getFromType('chords'), [c1], 'get from type chords');
				assert.deepEqual(msm.getFromType('melody'), [n1,n2], 'get from type melody');
				assert.deepEqual(msm.getLastNote(), n2, 'get last note');

				msm.removeFromType('melody');
				assert.deepEqual(msm.getSong(), [c1], 'Remove melody');

				msm.setSong(n1);
				assert.deepEqual(msm.getSong(), [c1,n1], 'Set without replace');

				msm.setSong(n1, true);
				assert.deepEqual(msm.getSong(), n1, 'Set with replace');

			});
		}
	}
});
