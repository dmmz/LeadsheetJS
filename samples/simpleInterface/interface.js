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

	var LJS = require('LJS');
	var myApp = {};
	window.myApp = myApp;



	/*var popIn = new PopIn('Hello', 'Test<br />ok');
	popIn.render();*/
	//myApp.historyV.activeView();
	/*myApp.historyM.addToHistory({},'Edit notes');
	myApp.historyM.addToHistory({});
	myApp.historyM.setCurrentPosition(1);*/
	var testSongs = require('tests/test-songs');

	// tried for unfolding
	// var songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.foldedSong);
	var songModel = LJS.converters.MusicCSLJson.SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);

	new LJS.LSViewer.OnWindowResizer(songModel);

	initPlayerModule(songModel);


	new LJS.HistoryC(songModel, $('#rightPanel'), 20, true, false);

	$.publish('ToHistory-add', 'Open song - ' + songModel.getTitle());

	/*
		var optionChediak = {
			displayTitle: true,
			displayComposer: true,
			displaySection: true,
			displayBar: true,
			delimiterBar: "",
			delimiterBeat: "/",
			unfoldSong: false, //TODO unfoldSong is not working yet
			fillEmptyBar: false,
			fillEmptyBarCharacter: "%",
		};
		initChordSequenceModule($('#chordSequence2')[0], songModel, optionChediak);*/


	myApp.viewer = new LJS.LSViewer.LSViewer($("#canvas_container")[0], {
		layer: true
			/*,
					typeResize: "scale"*/
	});
	var menu = new LJS.MainMenu(document.getElementById('menu-container'));

	var edition = new LJS.Edition.Edition(myApp.viewer, songModel, menu.model, {
		notes: {
			active: true,
			menu: {
				title: 'Notes',
				order: 2
			},
			imgPath: '/modules/NoteEdition/img'
		},
		chords: {
			active: true,
			menu: {
				title: 'Chords',
				order: 3
			},
			imgPath: '/modules/NoteEdition/img'
				// menu: false /* if we don't want menu*/
		},
		structure: {
			active: true,
			menu: {
				title: 'Structure',
				order: 4
			},
			imgPath: '/modules/StructureEdition/img'
		},
		composer:{
			suggestions:['Adam Smith','Kim Jong-il','Iñigo Errejón','Mia Khalifa','Jose Monge']
		}
	});

	//ALTERNATIVE WAY TO CREATE EDITION if not using edition constructor
	// var KeyboardManager = require('modules/Edition/src/KeyboardManager');
	// new KeyboardManager(true);

	// // Edit notes on view
	// var cursorNote = new LJS.Cursor(songModel.getComponent('notes'), 'notes', 'arrow');
	// var noteEdition = new LJS.NoteEdition(songModel, cursorNote.controller.model, myApp.viewer, '/modules/NoteEdition/img');

	// // // Edit chords on view
	// var cursorChord = new LJS.Cursor(songModel.getSongTotalBeats(), 'chords', 'tab');
	// cursorChord.controller.model.setEditable(false);

	// var chordEdition = new LJS.ChordEdition(songModel, cursorChord.controller.model, myApp.viewer, '/modules/NoteEdition/img');
	//bars edition 
	//var structEdition = new LJS.StructureEdition(songModel, edition.cursorNote.controller.model, '/modules/StructureEdition/img');

	// Harmonize menu
	var harm = new LJS.Harmonizer(songModel, menu.model);

	// Harmonic Analysis menu

	var harmAn = new LJS.HarmonicAnalysis(songModel, edition.noteEdition.noteSpaceMng);

	// Edit files menu
	var fileEdition = new LJS.FileEdition(songModel, myApp.viewer.canvas);

	var params = {
		showHalfWave: true,
		//drawMargins: true,
		topAudio: -120,
		heightAudio: 75,
		file: '/tests/audio/solar.wav',
		tempo: 170
	};
	var waveMng = new LJS.Wave(songModel, edition.cursorNote.controller.model, myApp.viewer, params);

	//ALTERNATIVE WAY TO ADD MENU if not done with edition constructor
	/*menu.model.addMenu({
		title: 'Notes',
		view: noteEdition.view,
		order: 2
	});

	menu.model.addMenu({
		title: 'Chords',
		view: chordEdition.view,
		order: 3
	});
	menu.model.addMenu({
		title: 'Structure',
		view: structEdition.view,
		order: 4
	});*/


	menu.model.addMenu({
		title: 'Harmonizer',
		view: harm.view,
		order: 5
	});

	menu.model.addMenu({
		title: 'Harmonic Analysis',
		view: harmAn.view,
		order: 6
	});


	menu.model.addMenu({
		title: 'File',
		view: fileEdition.view,
		order: 1
	});
	menu.controller.loadStateTab();
	if (typeof menu.model.getCurrentMenu() === "undefined") {
		menu.controller.activeMenu('File');
	}


	function initPlayerModule(songModel) {
		var player = new LJS.MidiCSL.PlayerModel_MidiCSL(songModel, "../../external-libs/Midijs/soundfont/");
		var pV = new LJS.MidiCSL.PlayerView($('#player_test')[0], '/modules/MidiCSL/img', {
			displayMetronome: true,
			displayLoop: true,
			displayTempo: true,
			changeInstrument: true,
			autoload: false,
			progressBar: true
		});
		var pC = new LJS.MidiCSL.PlayerController(player, pV);
	}
	
	var audioComments = new LJS.AudioComments(waveMng, myApp.viewer, songModel);
	audioComments.addComment({
		user: 'Dani',
		img: '/tests/img/dani-profile.jpg',
		text: 'This is an audio comment',
		timeInterval: [1.5891220809932014, 2.668046112917529],
		color: '#F00'
	});

	audioComments.addComment({
		user: 'Dani',
		img: '/tests/img/dani-profile.jpg',
		text: 'lorem ipsum cumulum largo texto asolo en caso de que tal cual pascual ande vas con la moto que thas comprado, vaya tela',
		timeInterval: [3.3, 10.1],
		color: '#0F0'
	});


	myApp.viewer.draw(songModel);
});