define([
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/Unfold/src/LeadsheetStructure',
	'modules/Unfold/src/UnfoldedLeadsheet',
	'modules/Unfold/src/StartLabel',
	'modules/Unfold/src/EndLabel',
	'modules/Unfold/src/PointLabel',
	'modules/core/src/SongModel',
	'tests/songs/AloneTogether',
	'tests/songs/unfold/DylansDelight',
	'tests/songs/unfold/SimpleUnfoldTest',
	'tests/songs/Solar'

], function(SongModel_CSLJson, LeadsheetStructure, UnfoldedLeadsheet, StartLabel, EndLabel,PointLabel, SongModel, AloneTogether, DylansDelight, SimpleUnfoldTest, Solar) {
	return {
		run: function() {
			test("LeadsheetStructure", function(assert) {
				var song = SongModel_CSLJson.importFromMusicCSLJSON(SimpleUnfoldTest);

						
				var struct = new LeadsheetStructure(song);

				var unfoldedSong = song.initUnfoldedSong();
								
				var startLabels = struct.getStartLabels();
				
				assert.equal(startLabels.size, 5);

				var endLabels = struct.getEndLabels();
				assert.equal(endLabels.size, 7);

				var unfoldConfig = struct.getUnfoldConfig();

				var segments = struct.getSegments();
				assert.equal(segments.length, 5);

				var unfoldedSections = struct.getUnfoldedLeadsheet(unfoldedSong, segments);
				// //var unfoldedLS = new UnfoldedLeadsheet(song, unfoldConfig);

				console.log(unfoldedSections);


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
