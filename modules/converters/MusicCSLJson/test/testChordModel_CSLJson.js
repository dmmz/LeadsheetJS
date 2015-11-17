define(['modules/converters/MusicCSLJson/src/ChordModel_CSLJson', 'modules/core/src/ChordModel'], function(ChordModel_CSLJson, ChordModel) {
	return {
		run: function() {
			test("ChordModel_CSLJson", function(assert) {
				var cm = new ChordModel();
				var t = ChordModel_CSLJson.exportToMusicCSLJSON(cm);
				// testing default export
				assert.deepEqual(t, {'ch':'','p':'',"beat":1});
				
				// testing export
				var chord = new ChordModel({'note':'G', 'chordType':'m7', 'beat':3, 'parenthesis': true, 'barNumber': 4});
				var exp = ChordModel_CSLJson.exportToMusicCSLJSON(chord);
				assert.deepEqual(exp,{'ch':'m7', 'p':'G', 'beat': 3, 'parenthesis': true} );

				// testing import
				var newChord = ChordModel_CSLJson.importFromMusicCSLJSON(exp);
				var exp2 = ChordModel_CSLJson.exportToMusicCSLJSON(newChord);
				assert.deepEqual(exp2,{'ch':'m7', 'p':'G', 'beat': 3, 'parenthesis': true} );
			});
		}
	}
});