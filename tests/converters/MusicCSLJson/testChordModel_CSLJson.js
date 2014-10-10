define(['modules/converters/MusicCSLJson/ChordModel_CSLJson', 'modules/core/ChordModel'], function(ChordModel_CSLJson, ChordModel) {
	return {
		run: function() {
			test("ChordModel_CSLJson", function(assert) {
				var cm = new ChordModel();
				var CSLJsonConverter = new ChordModel_CSLJson();
				var t = CSLJsonConverter.exportToMusicCSLJSON(cm);
				//assert.deepEqual(t, cm.exportToMusicCSLJSON());
				expect(0);

			});
		}
	}
});