require.config({
	baseUrl: "../../",
	paths: {
		jquery: 'external-libs/jquery-2.1.0.min',
		vexflow: 'external-libs/vexflow-min',
		//Midijs: 'external-libs/Midijs/midijs.min',
		pubsub: 'external-libs/tiny-pubsub.min'
	},
	shim: {
		'vexflow': {
			exports: 'Vex'
		}
	}
});

define(function(require){
	var $ = require('jquery');
	var Vex = require('vexflow');
	
	var LSViewer = require('modules/LSViewer/src/LSViewer');
	var SongModel = require('modules/core/src/SongModel');
	var AloneTogether = require('tests/songs/AloneTogether');
	var SongModel_CSLJson = require('modules/converters/MusicCSLJson/src/SongModel_CSLJson');

	var songModel = SongModel_CSLJson.importFromMusicCSLJSON(AloneTogether, new SongModel());

	var viewer = new LSViewer('ls1');
	
	viewer.draw(songModel);
	

	// var LS = new LeadsheetJS({
	// 	idDivContainer: 'ls1',
	// 	score: aloneTogether
	// });

	// LeadsheetJS.construct({
	// 	divContainer: 'ls2'
	// });
	
});