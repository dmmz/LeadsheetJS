//Require and Qunit working, done following  http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests
require.config({
	baseUrl: "../../",
	paths: {
		jquery: 'external-libs/jquery-2.1.0.min',
		vexflow_helper: 'external-libs/vexflow_test_helpers',
		vexflow: 'external-libs/vexflow-min',
		Midijs: 'external-libs/Midijs/midijs.min',
		pubsub: 'external-libs/tiny-pubsub.min',
		LeadsheetJS: 'build/LeadsheetJS-1.0.0.min',
	},
	shim: {
		'LeadsheetJS': {
			exports: 'LS'
		},
		'vexflow': {
			exports: 'Vex'
		},
		'Midijs': {
			exports: 'MIDI'
		}
	}
});

define(function(require) {

	var UserLog = require('utils/UserLog');
	var AjaxUtils = require('utils/AjaxUtils');

	var SongModel = require('modules/core/src/SongModel');
	var TimeSignatureModel = require('modules/core/src/TimeSignatureModel');

	var LSViewer = require('modules/LSViewer/src/LSViewer');
	var musicXMLParser = require('modules/converters/MusicXML/utils/musicXMLParser');
	var SongModel_MusicXML = require('modules/converters/MusicXML/src/SongModel_MusicXML');
	
	var filepath = '';
	filepath = '/samples/musicXML/Faire fi de tout.xml';
	filepath = '/samples/musicXML/Ferme.xml';
	var song = SongModel_MusicXML.importFromMusicXML(filepath);
	//console.log(song);
	initViewerModule(song);

	/*filepath = '/samples/musicXML/belleville_solo.xml';
	var song2 = SongModel_MusicXML.importFromMusicXML(filepath);
	initViewerModule(song2);*/
	function initViewerModule(songModel) {
		var viewer = new LSViewer($('#score')[0]);
		viewer.draw(songModel);
	}
});