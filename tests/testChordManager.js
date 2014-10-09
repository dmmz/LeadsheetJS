define(['modules/core/ChordManager', 'modules/core/ChordModel'], function(ChordManager, ChordModel) {
	return {
		run: function() {
			test("ChordManager", function(assert) {
				var chordManager = new ChordManager();

				assert.equal(chordManager.getTotal(), 0);
				chordManager.addChord();
				assert.equal(chordManager.getTotal(), 1);

				assert.throws(function() {
					chordManager.removeChord();
				});
				var chord = new ChordModel();
				chord.setNote('NC');
				chordManager.insertChord(0, chord);
				assert.equal(chordManager.getTotal(), 2);
				
				chordManager.removeChord(chord);
				assert.equal(chordManager.getTotal(), 1);
				assert.equal(chordManager.getChordIndex(chord), undefined);
			});
		}
	}
});