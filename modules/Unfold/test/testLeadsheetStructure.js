define([
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/Unfold/src/LeadsheetStructure',
	'modules/Unfold/src/StartLabel',
	'modules/Unfold/src/EndLabel',
	'modules/Unfold/src/PointLabel',
	'tests/songs/AloneTogether',
	'tests/songs/unfold/DylansDelight',
	'tests/songs/Solar'

], function(SongModel_CSLJson, LeadsheetStructure, StartLabel, EndLabel,PointLabel,  AloneTogether, DylansDelight, Solar) {
	return {
		run: function() {
			test("LeadsheetStructure", function(assert) {
				var songAT = SongModel_CSLJson.importFromMusicCSLJSON(DylansDelight);
				var structAT = new LeadsheetStructure(songAT);
				structAT.init();
			/*console.log(structAT.getStartLabels());
				
				
				assert.equal(structAT.endLabels,null);
				*/
				/*console.log(StartLabel);
				console.log(EndLabel);
				console.log(PointLabel);*/
				
				// test: probar con canciones con repeat = 'OPEN' p. ej: 515946a558e3386e4b000000
				// 
			});
		}
	};
});
