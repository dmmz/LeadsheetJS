define(['modules/midiCSLModel/src/SongModel_midiCSLModel', 'modules/midiCSLModel/src/NoteModel_midiCSLModel'], 
	function(SongModel_midiCSLModel, NoteModel_midiCSLModel) {
	return {
		run: function() {
			test("SongModel_midiCSLModel", function(assert) {
				var msm = new SongModel_midiCSLModel();
				assert.deepEqual(msm.getSong(), []);

				var n1 = new NoteModel_midiCSLModel({'currentTime': 0, 'duration': 1, 'midiNote': [45], 'type': 'melody'});
				var n2 = new NoteModel_midiCSLModel({'currentTime': 1, 'duration': 1, 'midiNote': [60], 'type': 'melody'});
				var c1 = new NoteModel_midiCSLModel({'currentTime': 0, 'duration': 1, 'midiNote': [60,65,67], 'type': 'chords'});
				
				var msm = new SongModel_midiCSLModel({song:[n1,n2,c1]});

				var msm2 = new SongModel_midiCSLModel();

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

				var clone = msm.clone();
				assert.deepEqual(msm, clone, "Clone test");
			});
		}
	}
});
