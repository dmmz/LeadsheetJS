define(['modules/core/ChordManagerModel'], function(ChordManagerModel) {
	return {
		run: function() {
			test("Chords", function(assert) {
				var chord = new ChordManagerModel();

				// Basic Test
				assert.equal(chord.toString(), "");
				assert.throws(function() {
					chord.setNote();
				});
				assert.equal(chord.getNote(), "");
				assert.equal(chord.getChordType(), "");
				assert.ok(!chord.getParenthesis());
				assert.deepEqual(chord.getBase(), {});

			});
		}
	}
});