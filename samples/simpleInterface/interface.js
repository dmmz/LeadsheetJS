//Require and Qunit working, done following  http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests
require.config({
	baseUrl: "../../",
	paths: {
		jquery: 'external-libs/jquery-2.1.0.min',
		jquery_autocomplete: 'external-libs/jquery.autocomplete.min',
		vexflow: 'external-libs/vexflow-min',
		Midijs: 'external-libs/Midijs/midijs.min',
		pubsub: 'external-libs/tiny-pubsub.min',
		mustache: 'external-libs/mustache',
		text: 'external-libs/require-text',
		bootstrap: 'external-libs/bootstrap/bootstrap.min',
		jsPDF: 'external-libs/jspdf/jspdf.min',
		JsonDelta: 'external-libs/json_delta_1.1.3_minified',
	},
	shim: {
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
	var $ = require('jquery');
	var LJS = require('LJS');
		
	// console.log(LJS);

	var testSongs = require('tests/test-songs');

	// var popIn = new LJS.PopIn.PopIn('Hello', 'Test<br />ok');
	// popIn.render();

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
			layer: true,
			detectEventOnAllDocument: true
			//typeResize: "fluid", // "scale" | "fluid"
			//heightOverflow: "auto", // "scroll" | "auto"
		}
	};

	var playerOptions = {
		HTMLElement: playerHTML,
		imgUrl: '/modules/MidiCSL/img',
		interactive: true,
		viewOptions: {
			displayMetronome: true,
			displayLoop: true,
			displayTempo: true,
			changeInstrument: false,
			autoload: false,
			progressBar: true
		},
		audio:{
			//audioFile: '/tests/audio/solar.wav',
			//tempo: 170
			audioFile: '/tests/audio/Solar_120_bpm.335',
			tempo: 120
		},
		midi:{
			soundfontUrl: soundfontUrl
		}
	};

	var tags = [{
			startBeat: 1,
			endBeat: 4,
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
		}];

	var params = {
		viewer: viewerOptions,
		tags : tags,
		player: playerOptions,
		edition: {
			notes: true,
			imgUrl: {
				notes: '/modules/NoteEdition/img',
				chords: '/modules/NoteEdition/img',
				structure: '/modules/NoteEdition/img',
			},
			chords: true,
			structure: true,
			history: {
				enable: true,
				HTMLElement: historyHTML, // if not precised, then it doesn't display history but keyboard ctrl+z and y are working
			},
			menu: {
				HTMLElement: menuHTML
			},
			composerSuggestions: ['Miles Davis', 'John Coltrane', 'Bill Evans', 'Charlie Parker', 'Thelonious Monk']
		},
	};

	// var myLeadsheet1 = LJS.easyBuild('viewer', testSongs.simpleLeadSheet, viewerHTML, viewerOptions);
	// var myLeadsheet2 = LJS.easyBuild('player', testSongs.simpleLeadSheet, playerHTML, playerOptions);
	var solar = require('tests/songs/Solar');
	var myLeadsheet = LJS.init(solar, params);
	//console.log(myLeadsheet);
	//function loadComments = function(waveMng, viewer, songModel) {
		var userSession = {
			name: 'Dani',
			id: '323324422',
			img: '/tests/img/avatar.png'
		};
		var commentsMng = new LJS.Comments({
			audio: myLeadsheet.audioPlayer,
			viewer: myLeadsheet.viewer, 
			song: myLeadsheet.songModel, 
			userSession: userSession, 
			noteSpaceManager: myLeadsheet.noteSpaceManager, 
			notesCursor: myLeadsheet.notesCursor,
			chordsEditor: myLeadsheet.edition.chordEdition
		});
		commentsMng.addComment({
			userName: 'Dani Martin Martinez',
			id: '1234e',
			userId: '323324422',
			img: userSession.img,
			text: 'This is a long audio comment, a very very long comment This is a long audio comment, a very very long comment This is a long audio comment, a very very long comment This is a long audio comment, a very very long comment This is a long audio comment, a very very long comment This is a long audio comment, a very very long comment This is a long audio comment, a very very long comment This is a long audio comment, a very very long comment This is a long audio comment, a very very long comment This is a long audio comment, a very very long comment This is a long audio comment, a very very long comment This is a long audio comment, a very very long comment This is a long audio comment, a very very long comment',
			timeInterval: [1.5891220809932014, 2.668046112917529],
			date: '1 min ago',
			type: 'audio'
		});

		var scoreComment = {
			userName: 'Dani',
			id: '98765',
			img:userSession.img,
			text: 'this is a notes comment' ,
			beatInterval:[1, 5],
			date: '1 day ago',
			type: 'notes'
		};
		commentsMng.addComment(scoreComment);

		commentsMng.addComment({
			userName: 'uampa',
			id:'123k304',
			img: userSession.img,
			text: 'this is chords comment',
			beatInterval:[1, 5],
			date: '1 month ago',
			type: 'chords'	
		});
		//we need to draw again to take into account the new comments module.  
		
		
		$.publish('ToViewer-draw', myLeadsheet.songModel);
		//return audioComments;
	//};
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