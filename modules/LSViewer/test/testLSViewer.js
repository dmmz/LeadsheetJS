define(['tests/DisplayTester',
	
	'modules/LSViewer/src/LSViewer',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/WaveManager/src/WaveManager',
	'tests/songs/allRhythmicFigures',
	'tests/songs/AloneTogether',
	'tests/songs/Solar',
], function(DisplayTester,  LSViewer, SongModel, SongModel_CSLJson, WaveManager, allRhythmicFigures,AloneTogether,Solar) {
	return {
		run: function() {
			
			//constructor functions
			var songModel = SongModel_CSLJson.importFromMusicCSLJSON(AloneTogether);

			var viewer = new LSViewer($('#ls1')[0],{typeResize: 'fluid',heightOverflow: 'scroll'});
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
				"Rhythmic figures",
				[
				'Globally: adapting bars per line to width',
				'Bar 4: all figure durations',
				'Bar8: all tie types',
				'Bar 8 to 9: tie jumping line',
				'Bar 10: triplets'
				]
			);
			song = SongModel_CSLJson.importFromMusicCSLJSON(AloneTogether);
			dispTest.runTest(function(divContainer) {
			
				viewer = new LSViewer(divContainer,{heightOverflow:'scroll'});
				viewer.draw(song);
			},
			{width:1200,height:1000},
			"Real song: AloneTogether scroll. div height is 1000 and canvas is larger, so it scrolls. ");

			dispTest.runTest(function(divContainer) {
				viewer = new LSViewer(divContainer,{heightOverflow:'resizeDiv',layer:true});
				viewer.draw(song);
				//test drawing on layer 
				
				viewer.layerCtx.font = "18px lato Verdana";
				viewer.layerCtx.fillText(" This square is drawn in a new layer (canvas) placed on top of the main canvas", 65, 30);
				viewer.layerCtx.fillStyle = "rgb(200,0,0)";
				viewer.layerCtx.fillRect (10, 10, 55, 50);

			},
			{width:1200,height:1000},
			"Real song: AloneTogether resideDiv. Same canvas as previous test,  same div height (1000), but now div height is adapted. Also, creating a new layer");

			
			dispTest.runTest(function(divContainer){
				var waveMng = new WaveManager();
				var viewer = new LSViewer(divContainer,{heightOverflow:'resizeDiv',lineMarginTop:150});
				var song = SongModel_CSLJson.importFromMusicCSLJSON(Solar);
				viewer.draw(song);	
				waveMng.load('/tests/audio/solar.wav',viewer,song);


			},{width:1200,height:1000}, "Painting audio");
		}
	};
});