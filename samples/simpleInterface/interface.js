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

	var KeyboardManager = require('modules/Edition/src/KeyboardManager');
	new KeyboardManager(true); 


	var WaveManager = require('modules/WaveManager/src/WaveManager');
	var WaveManagerView = require('modules/WaveManager/src/WaveManagerView');
	var WaveManagerController = require('modules/WaveManager/src/WaveManagerController');


	var LJS = require('LJS');
	var myApp = {};
	window.myApp = myApp;

	var onWindowResizer = require('modules/LSViewer/src/OnWindowResizer');

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
	
	onWindowResizer(songModel);

	initPlayerModule(songModel);


	new LJS.HistoryC(songModel);

	$.publish('ToHistory-add', {
		'item': testSongs.simpleLeadSheet,
		'title': 'Open song - ' + songModel.getTitle()
	});

	new LJS.chordSequence(
		$('#chordSequence1')[0],
		songModel, {
			displayTitle: true,
			displayComposer: true,
			displaySection: true,
			displayBar: true,
			delimiterBar: "|",
			fillEmptyBar: true,
			fillEmptyBarCharacter: "%"
		}
	);

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
		layer: true/*,
		typeResize: "scale"*/
	});
	var menu = new LJS.MainMenu(document.getElementById('menu-container'));


	// Edit notes on view
	var cursorNote = new LJS.Cursor(songModel.getComponent('notes'), 'notes', 'arrow');
	var noteEdition = new LJS.NoteEdition(songModel, cursorNote.controller.model, myApp.viewer, '/modules/NoteEdition/img');

	// // Edit chords on view
	var cursorChord = new LJS.Cursor(songModel.getSongTotalBeats(), 'chords', 'tab');
	cursorChord.controller.model.setEditable(false);

	var chordEdition = new LJS.ChordEdition(songModel, cursorChord.controller.model, myApp.viewer, '/modules/NoteEdition/img');

	// Harmonize menu
	var harm = new LJS.Harmonizer(songModel, menu.model);

	// Harmonic Analysis menu

	var harmAn = new LJS.HarmonicAnalysis(songModel);

	// Constraint menu
	var constraint = new LJS.Constraint(songModel);

	//bars edition 
	var structEdition = new LJS.StructureEdition(songModel, cursorNote.controller.model, '/modules/StructureEdition/img');


	// Edit files menu
	var fileEdition = new LJS.FileEdition(songModel, myApp.viewer.canvas);
       
    var params = {
      showHalfWave: true,
      //drawMargins: true,
      topAudio: -100,
      heightAudio: 75/*,
      marginCursor: 20*/
    };
     var waveMng = new WaveManager(songModel, cursorNote.controller.model, myApp.viewer, params);
    //noteSpaceManager.refresh();
    waveMng.load('/tests/audio/solar.wav', 170);
	var wmc = new WaveManagerController(waveMng);

	noteEdition.view.render(undefined, function() {
		menu.model.addMenu({
			title: 'Notes',
			view: noteEdition.view,
			order: 2
		});
	});

	chordEdition.view.render(undefined, function() {
		menu.model.addMenu({
			title: 'Chords',
			view: chordEdition.view,
			order: 3
		});
	});
	structEdition.view.render(undefined, function() {
		menu.model.addMenu({
			title: 'Structure',
			view: structEdition.view,
			order: 4
		});
	});
	constraint.view.render(undefined, function() {
		menu.model.addMenu({
			title: 'Constraint',
			view: constraint.view,
			order: 5
		});
		// menuC.activeMenu('Constraint');
	});
	harm.view.render(undefined, function() {
		menu.model.addMenu({
			title: 'Harmonizer',
			view: harm.view,
			order: 6
		});
	});
	harmAn.view.render(undefined, function() {
		menu.model.addMenu({
			title: 'Harmonic Analysis',
			view: harmAn.view,
			order: 7
		});
	});
	fileEdition.view.render(undefined, function() {
		menu.model.addMenu({
			title: 'File',
			view: fileEdition.view,
			order: 1
		});
		menu.controller.loadStateTab();
		if (typeof menu.model.getCurrentMenu() === "undefined") {
			menu.controller.activeMenu('File');
		}
	});
	//$.publish('ToViewer-draw', songModel);



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
});