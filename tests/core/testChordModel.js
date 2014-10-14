define(['modules/core/ChordModel'], function(ChordModel) {
	return {
		run: function() {
			test("Chords", function(assert) {
				var chord = new ChordModel();
				
				// Basic Test
				assert.equal(chord.toString(), "");
				assert.throws(function() {
					chord.setNote();
				});
				assert.equal(chord.getNote(), "");
				assert.equal(chord.getChordType(), "");
				assert.ok(!chord.getParenthesis());
				assert.deepEqual(chord.getBase(), {});

				// Adding base chord
				var chordBase = new ChordModel();
				chordBase.setNote('G');
				chordBase.setChordType('m');
				chord.setBase(chordBase);
				assert.equal(chord.getBase().getNote(), "G");
				assert.equal(chord.getBase().getChordType(), "m");
				// Remove base chord
				chord.setBase("");
				
				// Accidentals
				chord.setNote("Db");
				assert.equal(chord.getNote(), "Db");

				// ChordTypes
				chord.setChordType("M7");
				assert.equal(chord.getChordType(), "M7");

				// testing to String
				assert.equal(chord.toString(), "DbM7");
				assert.equal(chord.toString(" "), "Db M7");
				chord.setParenthesis(true);

				assert.equal(chord.toString(""), "(DbM7)");

				// setChordFromString
				chord.setChordFromString('A#m9/E');
				assert.equal(chord.getNote(), "A#");
				assert.equal(chord.getChordType(), "m9");
				assert.equal(chord.getBase().getNote(), "E");
				assert.equal(chord.getBase().getChordType(), "");

				var newChord = new ChordModel({'note':'G', 'chordType':'m7', 'beat':3});
				assert.equal(newChord.getNote(), "G");
			});
		}
	}
});