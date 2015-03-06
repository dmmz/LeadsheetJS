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
		
	var LSViewer = require('modules/LSViewer/src/LSViewer');
	var SongModel = require('modules/core/src/SongModel');
	var AloneTogether = require('tests/songs/AloneTogether');
	var SongModel_CSLJson = require('modules/converters/MusicCSLJson/src/SongModel_CSLJson');

	var songModel = SongModel_CSLJson.importFromMusicCSLJSON(AloneTogether, new SongModel());

	var viewer = new LSViewer($('#ls1')[0],{typeResize: 'fluid'});
	viewer.draw(songModel);

	var viewer2 = new LSViewer($('#ls2')[0],{typeResize: 'scale'});
	viewer2.draw(songModel);
	
	
});