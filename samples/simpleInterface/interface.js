//Require and Qunit working, done following  http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests
require.config({
	baseUrl: "../../",
	paths: {
		jquery: 'external-libs/jquery-2.1.0.min',
		jquery_autocomplete: 'external-libs/jquery.autocomplete.min',
		qunit: 'external-libs/qunit/qunit',
		vexflow_helper: 'external-libs/vexflow_test_helpers',
		vexflow: 'external-libs/vexflow-min',
		Midijs: 'external-libs/Midijs/midijs.min',
		pubsub: 'external-libs/tiny-pubsub.min',
		mustache: 'external-libs/mustache',
		text: 'external-libs/require-text',
		bootstrap: 'external-libs/bootstrap/bootstrap.min',
		jsPDF: 'external-libs/jspdf/jspdf.min',
		//bootstrap: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min',
		LeadsheetJS: 'build/LeadsheetJS-0.1.0.min',
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
		'HTMLElement': viewerHTML,
		'viewOptions': {
			'displayTitle': true,
			'displayComposer': true,
			'layer': true,
			'typeResize': "fluid", // "scale" | "fluid"
			'heightOverflow': "auto", // "scroll" | "auto"
		}
	};

	var playerOptions = {
		'soundfontUrl': soundfontUrl,
		'HTMLElement': playerHTML,
		'pictureUrl': '/modules/MidiCSL/img',
		'viewOptions': {
			'displayMetronome': true,
			'displayLoop': true,
			'displayTempo': true,
			'changeInstrument': true,
			'autoload': false,
			'progressBar': true
		}
	};

	var params = {
		'viewer': viewerOptions,
		'player': playerOptions,
		'edition': {
			'notes': true,
			'chords': true,
			'structure': true,
			'history': {
				'enable': true,
				'HTMLElement': historyHTML, // if not precised, then it doesn't display history but keyboard ctrl+z and y are working

			}
		},
		'menu': {
			'HTMLElement': menuHTML
		}
	};
	// var myLeadsheet1 = LJS.easyBuild('viewer', testSongs.simpleLeadSheet, viewerHTML, viewerOptions);
	// var myLeadsheet2 = LJS.easyBuild('player', testSongs.simpleLeadSheet, playerHTML, playerOptions);
	var myLeadsheet = LJS.init(testSongs.simpleLeadSheet, params);
	console.log(myLeadsheet);
	if (typeof myLeadsheet.audioComments !== "undefined") {
		addComments(myLeadsheet.audioComments);
	}

	function addComments(audioComments) {
		audioComments.addComment({
			userName: 'Dani Martin Martinez',
			id: '1234e',
			img: '/tests/img/dani-profile.jpg',
			text: 'This is an audio comment',
			timeInterval: [1.5891220809932014, 2.668046112917529],
			color: '#FFBF00',
			date: '1 min ago'
		});

		audioComments.addComment({
			userName: 'Dani',
			id: '1234',
			img: '/tests/img/dani-profile.jpg',
			text: 'lorem ipsum cumulum largo texto asolo en caso de que tal cual pascual ande vas con la moto que thas comprado, vaya tela',
			timeInterval: [3.3, 10.1],
			color: '#0F0'
		});
	}

});