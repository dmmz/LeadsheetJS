//Require and Qunit working, done following  http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests
require.config({
	baseUrl: "../../",
	paths: {
		jquery: 'external-libs/jquery-2.1.0.min',
		// jquery_autocomplete: 'external-libs/jquery.autocomplete.min',
		vexflow: 'external-libs/vexflow-min',
		// Midijs: 'external-libs/Midijs/midijs.min',
		pubsub: 'external-libs/tiny-pubsub.min',
		// mustache: 'external-libs/mustache',
		// text: 'external-libs/require-text',
		// bootstrap: 'external-libs/bootstrap/bootstrap.min',
		// jsPDF: 'external-libs/jspdf/jspdf.min',
		// JsonDelta: 'external-libs/json_delta_1.1.3_minified',
		//bootstrap: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min',
	},
	shim: {
		// 'LeadsheetJS': {
		//	exports: 'LS'
		// },
		vexflow: {
			exports: 'Vex'
		},
		Midijs: {
			exports: 'MIDI'
		},
		JsonDelta: {
			exports: 'JSON_delta'
		}
	}
});

define(function(require) {
	//var $ = require('jquery');
	//var LJS = require('LJS');
	var chordsSong = require('/samples/chordsSequence/solar-chords');
	//var chordsSong = require('tests/songs/AloneTogether');
	var SongModel_CSLJson = require('modules/converters/MusicCSLJson/src/SongModel_CSLJson');
	
	var LSChordSequenceViewer = require('modules/LSViewer/src/LSChordSequenceViewer');
	var OnWindowResizer = require('modules/LSViewer/src/OnWindowResizer');
	
	var songModel = SongModel_CSLJson.importFromMusicCSLJSON(chordsSong);

	var viewer = new LSChordSequenceViewer($("#canvas_container")[0]);
	OnWindowResizer(songModel);

	viewer.draw(songModel);

	// console.log(LJS);


	/*var viewerHTML = $("#canvas_container")[0];
	var playerHTML = $('#player_test')[0];

	var historyHTML = $('#rightPanel');
	

	var viewerOptions = {
		HTMLElement: viewerHTML,
		viewOptions: {
			//displayTitle: true,
			//displayComposer: true,
			layer: true,
			detectEventOnAllDocument: true
			//typeResize: "fluid", // "scale" | "fluid"
			//heightOverflow: "auto", // "scroll" | "auto"
		}
	};

	var playerOptions = {
		HTMLElement: playerHTML,
		imgUrl: '/modules/MidiCSL/img',
		viewOptions: {
			displayMetronome: true,
			displayLoop: true,
			displayTempo: true,
			changeInstrument: false,
			autoload: false,
			progressBar: true
		},
		audio:{
			audioFile: '/tests/audio/solar.wav',
			tempo: 120
		}
	};

	
	var params = {
		viewer: viewerOptions,
		player: playerOptions
		
	
	};

;
	var myLeadsheet = LJS.init(afoxeSong, params);
	//console.log(myLeadsheet);
	/*if (typeof myLeadsheet.audioComments !== "undefined") {
		addComments(myLeadsheet.audioComments);
	}
	if (typeof myLeadsheet.audioPlayer !== "undefined") {
		myLeadsheet.audioPlayer.load('/tests/audio/solar.wav', 170, true);
	}

	function addComments(audioComments) {
		audioComments.addComment({
			userName: 'Dani Martin Martinez',
			id: '1234e',
			userId: '323324422',
			img: '/tests/img/dani-profile.jpg',
			text: 'This is an audio comment',
			timeInterval: [1.5891220809932014, 2.668046112917529],
			date: '1 min ago'
		});

		audioComments.addComment({
			userName: 'Dani',
			id: '1234',
			img: '/tests/img/avatar.png',
			text: 'lorem ipsum cumulum largo texto asolo en caso de que tal cual pascual ande vas con la moto que thas comprado, vaya tela',
			timeInterval: [3.3, 10.1],

		});
	}*/

});
