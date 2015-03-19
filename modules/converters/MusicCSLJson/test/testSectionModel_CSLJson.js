define(['modules/converters/MusicCSLJson/src/SectionModel_CSLJson', 'modules/core/src/SectionModel'], function(SectionModel_CSLJson, SectionModel) {
	return {
		run: function() {
			test("SectionModel_CSLJson", function(assert) {
				var section = new SectionModel();
				var t = SectionModel_CSLJson.exportToMusicCSLJSON(section);
				assert.deepEqual(t, {"name":""});

				var section = new SectionModel({"name":"A", 'repeatTimes':2, "numberOfBars":8, "style":"Bossa Nova"});
				var exp = SectionModel_CSLJson.exportToMusicCSLJSON(section);
				assert.deepEqual(exp, {"name":"A", 'repeat':2, "style":"Bossa Nova"});

				// testing import
				var newSection = new SectionModel();
				SectionModel_CSLJson.importFromMusicCSLJSON(exp, newSection);
				var exp2 = SectionModel_CSLJson.exportToMusicCSLJSON(newSection);
				assert.deepEqual(exp2, {"name":"A", 'repeat':2, "style":"Bossa Nova"});
			});
		}
	}
});