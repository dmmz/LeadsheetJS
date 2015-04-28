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

	var songModel = LJS.converters.MusicCSLJson.SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);
	// initPlayerModule(songModel);

	new LJS.HistoryC(songModel);

	$.publish('ToHistory-add', {
		'item': testSongs.simpleLeadSheet,
		'title': 'Open song - ' + songModel.getTitle()
	});
	
	new LJS.chordSequence(
		$('#chordSequence1')[0], 
		songModel, 
		{
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

	myApp.viewer = new LJS.LSViewer.LSViewer($("#canvas_container")[0],{layer:true});

	var menuM = new LJS.MainMenu.MainMenuModel();
	var menuC = new LJS.MainMenu.MainMenuController(menuM);

	$.subscribe('MainMenuView-render', function(el) {
		// Edit notes on view
		var cursorNote = new LJS.Cursor(songModel.getComponent('notes'), songModel, 'notes', 'arrow');
		var noteEdition = new LJS.NoteEdition(songModel,cursorNote.controller.model,'/modules/NoteEdition/img');

		// Edit chords on view
		var cursorChord = new LJS.Cursor(songModel.getSongTotalBeats(), songModel, 'chords', 'tab');
		cursorChord.controller.model.setEditable(false);

		var chordEdition = new LJS.ChordEdition(songModel,cursorChord.controller.model,'/modules/NoteEdition/img');

		// Harmonize menu
		var harm = new LJS.Harmonizer(songModel,menuM);
		
		// Harmonic Analysis menu
		var haV = new LJS.HarmonicAnalysis.HarmonicAnalysisView();
		var haC = new LJS.HarmonicAnalysis.HarmonicAnalysisController(songModel, haV);

		// Constraint menu
		var constraint = new LJS.Constraint(songModel);
		
		//bars edition 
		var structEdition = new LJS.StructureEdition(songModel, cursorNote.controller.model, '/modules/StructureEdition/img');

		// Edit files menu
		var feV = new LJS.FileEdition.FileEditionView();
		var feC = new LJS.FileEdition.FileEditionController(songModel, myApp.viewer.canvas);

		noteEdition.view.render(undefined, function() {
			menuM.addMenu({
				title: 'Notes',
				view: noteEdition.view,
				order: 2
			});
			menuC.activeMenu('Notes');
		});
		chordEdition.view.render(undefined, function() {
			menuM.addMenu({
				title: 'Chords',
				view: chordEdition.view,
				order: 3
			});
		});
		structEdition.view.render(undefined, function() {
			menuM.addMenu({
				title: 'Structure',
				view: structEdition.view,
				order: 4
			});
		});
		constraint.view.render(undefined, function() {
			menuM.addMenu({
				title: 'Constraint',
				view: constraint.view,
				order: 5
			});
			// menuC.activeMenu('Constraint');
		});
		harm.view.render(undefined, function() {
			menuM.addMenu({
				title: 'Harmonizer',
				view: harm.view,
				order: 6
			});
		});
		haV.render(undefined, function() {
			menuM.addMenu({
				title: 'Harmonic Analysis',
				view: haV,
				order: 7
			});
		});
		feV.render(undefined, function() {
			menuM.addMenu({
				title: 'File',
				view: feV,
				order: 1
			});
		});
		$.publish('ToViewer-draw', songModel);
	});

	var menuV = new LJS.MainMenu.MainMenuView(menuM, document.getElementById('menu-container'));




	function initPlayerModule(songModel) {
		// Create a song from testSong
		var player = new PlayerModel_MidiCSL(songModel, "../../external-libs/Midijs/soundfont/");
		var pV = new PlayerView($('#player_test')[0], '/modules/MidiCSL/img', {
			displayMetronome: true,
			displayLoop: true,
			displayTempo: true,
			changeInstrument: true,
			autoload: false,
			progressBar: true
		});
		var pC = new PlayerController(player, pV);
	}
});