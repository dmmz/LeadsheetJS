define(['tests/DisplayTester',
	
	'modules/LSViewer/src/LSViewer',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'tests/songs/allRhythmicFigures',
	'tests/songs/AloneTogether'
], function(DisplayTester,  LSViewer, SongModel, SongModel_CSLJson, allRhythmicFigures,AloneTogether) {
	return {
		run: function() {
			
			//constructor functions
			var songModel = SongModel_CSLJson.importFromMusicCSLJSON(AloneTogether);
			var viewer = new LSViewer($('#ls1')[0],{typeResize: 'fluid'});
			viewer.draw(songModel);

			var viewer2 = new LSViewer($('#ls2')[0],{typeResize: 'scale'});
			viewer2.draw(songModel);
			

			var dispTest = new DisplayTester();
			dispTest.runTest(
				function(divContainer){
					var song = SongModel_CSLJson.importFromMusicCSLJSON(allRhythmicFigures);
					var viewer = new LSViewer(divContainer);
					viewer.draw(song);
				},
				{width:1200,height:1000},
				"Rhythmic figueres",
				[
				'Globally: adapting bars per line to width',
				'Bar 4: all figure durations',
				'Bar8: all tie types',
				'Bar 8 to 9: tie jumping line',
				'Bar 10: triplets'
				]
			);
		
			dispTest.runTest(function(divContainer) {
				song = SongModel_CSLJson.importFromMusicCSLJSON(AloneTogether);
				viewer = new LSViewer(divContainer);
				viewer.draw(song);
			},{width:1200,height:1000},"Real song: AloneTogether");

		}
	};
});