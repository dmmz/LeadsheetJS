define(['modules/converters/MusicCSLJson/SectionModel_CSLJson', 'modules/core/SectionModel'], function(SectionModel_CSLJson, SectionModel) {
	return {
		run: function() {
			test("SectionModel_CSLJson", function(assert) {
				var section = new SectionModel();
				var CSLJsonConverter = new SectionModel_CSLJson();
				var t = CSLJsonConverter.exportToMusicCSLJSON(section);
				//assert.deepEqual(t, section.exportToMusicCSLJSON());
				expect(0);
			});
		}
	}
});