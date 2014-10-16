define(['modules/converters/MusicCSLJson/src/BarModel_CSLJson', 'modules/core/src/BarModel'], function(BarModel_CSLJson, BarModel) {
	return {
		run: function() {
			test("BarModel_CSLJson", function(assert) {
				var bar = new BarModel();
				var t = BarModel_CSLJson.exportToMusicCSLJSON(bar);
				expect(0);
			});
		}
	}
});