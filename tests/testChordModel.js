define(['modules/core/ChordModel'], function(ChordModel) {
	return {
		run: function() {
			test("Chords", function(assert) {
				var chord = new ChordModel();
				assert.equal(chord.toString(), "");
				assert.throws(function(){
					chord.setNote();
				});
			});
		}
	}
});