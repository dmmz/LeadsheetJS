define(['modules/converters/MusicCSLJson/SectionModel_CSLJson', 'modules/core/SectionModel'], function(SectionModel_CSLJson, SectionModel) {
	return {
		run: function() {
			test("SectionModel_CSLJson", function(assert) {
				var section = new SectionModel();
				var CSLJsonConverter = new SectionModel_CSLJson();
				var t = CSLJsonConverter.exportToMusicCSLJSON(section);
				assert.deepEqual(t, {"name":""});


				var section = new SectionModel({"name":"A", 'repeatTime':2, "numberOfBars":8, "style":"Bossa Nova"});
				var CSLJsonConverter = new SectionModel_CSLJson();
				var exp = CSLJsonConverter.exportToMusicCSLJSON(section);
				assert.deepEqual(exp, {"name":"A", 'repeat':2, "style":"Bossa Nova"});

				// testing import
				var newSection = new SectionModel();
				CSLJsonConverter.importFromMusicCSLJSON(exp, newSection);
				var exp2 = CSLJsonConverter.exportToMusicCSLJSON(newSection);
				assert.deepEqual(exp2, {"name":"A", 'repeat':2, "style":"Bossa Nova"});
			});
		}
	}
});