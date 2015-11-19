//Require and Qunit working, done following  http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests
require.config({
	baseUrl: "../../",
	paths: {
		jquery: 'external-libs/jquery-2.1.0.min',
		// jquery_autocomplete: 'external-libs/jquery.autocomplete.min',
		vexflow: 'external-libs/vexflow-min',
		Midijs: 'external-libs/Midijs/midijs.min',
		pubsub: 'external-libs/tiny-pubsub.min',
		mustache: 'external-libs/mustache',
		text: 'external-libs/require-text',
		// bootstrap: 'external-libs/bootstrap/bootstrap.min',
		// jsPDF: 'external-libs/jspdf/jspdf.min',
		//bootstrap: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min',
	},
	shim: {
		// 'LeadsheetJS': {
		// 	exports: 'LS'
		// },
		'vexflow': {
			exports: 'Vex'
		},
		'Midijs': {
			exports: 'MIDI'
		}
	}
});

define(function(require) {
	var $ = require('jquery');
	var LJS = require('LJS');
	
	// console.log(LJS);

	var testSongs = require('tests/test-songs');

	//var popIn = new LJS.PopIn.PopIn('Hello', 'Test<br />ok');
	//popIn.render();

	var menuHTML = document.getElementById('menu-container');
	var viewerHTML = $("#canvas_container")[0];
	var playerHTML = $('#player_test')[0];

	var historyHTML = $('#rightPanel');
	var soundfontUrl = "../../external-libs/Midijs/soundfont/";

	var viewerOptions = {
		HTMLElement: viewerHTML,
		viewOptions: {
			//displayTitle: true,
			//displayComposer: true,
			layer: true//,
			//typeResize: "fluid", // "scale" | "fluid"
			//heightOverflow: "auto", // "scroll" | "auto"
		}
	};

	var playerOptions = {
		soundfontUrl: soundfontUrl,
		HTMLElement: playerHTML,
		imgUrl: '/modules/MidiCSL/img',
		viewOptions: {
			displayMetronome: true,
			displayLoop: true,
			displayTempo: true,
			changeInstrument: true,
			autoload: false,
			progressBar: true
		},
		useAudio: true,
		audioFile: '/tests/audio/solar.wav'
	};

	var tagOptions = {
		analysis: [{
			startBeat: 1,
			endBeat: 5,
			name: 'First bar',
			color: "#559"
		}, {
			startBeat: 5,
			endBeat: 16,
			name: 'This is second part',
			color: "#995"
		}, {
			startBeat: 16,
			endBeat: 33,
			name: 'New line !',
			color: "#599"
		}, {
			startBeat: 44,
			endBeat: 49,
			name: 'Outro',
			color: "#595"
		}]
	}

	var params = {
		viewer: viewerOptions,
		//tag : tagOptions,
		player: playerOptions//,
		/*'edition': {
			'notes': true,
			'imgUrl': {
				'notes': '/modules/NoteEdition/img',
				'chords': '/modules/NoteEdition/img',
				'structure': '/modules/NoteEdition/img',
			},
			'chords': true,
			'structure': true,
			'history': {
				'enable': true,
				'HTMLElement': historyHTML, // if not precised, then it doesn't display history but keyboard ctrl+z and y are working
			}
		},
		'menu': {
			'HTMLElement': menuHTML
		}*/
	};

	// var myLeadsheet1 = LJS.easyBuild('viewer', testSongs.simpleLeadSheet, viewerHTML, viewerOptions);
	// var myLeadsheet2 = LJS.easyBuild('player', testSongs.simpleLeadSheet, playerHTML, playerOptions);
	var myLeadsheet = LJS.init(testSongs.simpleLeadSheet, params);
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