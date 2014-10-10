define(['modules/converters/MusicCSLJson/BarModel_CSLJson', 'modules/core/BarModel'], function(BarModel_CSLJson, BarModel) {
	return {
		run: function() {
			test("BarModel_CSLJson", function(assert) {
				var bar = new BarModel();
				var CSLJsonConverter = new BarModel_CSLJson();
				var t = CSLJsonConverter.exportToMusicCSLJSON(bar);
				assert.deepEqual(t, bar.exportToMusicCSLJSON());
			});
		}
	}
});