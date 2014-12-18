define(['vexflow_helper',
	'vexflow',
	'modules/LSViewer/src/LSViewer',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'tests/test-songs'
], function(VexFlowTest, Vex, LSViewer, SongModel, SongModel_CSLJson, testSongs) {
	return {
		run: function() {
			console.log(VexFlowTest);
			VexFlowTest.runTest("ViewerDraw", function(options, contextBuilder) {
				console.log(options);
				var ctx = new contextBuilder(options.canvas_sel, 1100, 1150);
				var song = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.allNoteFigures, new SongModel());


				var viewer = new LSViewer(ctx);

				viewer.draw(song);
				
				ok(true, "all pass");

			});

		}
	};
});