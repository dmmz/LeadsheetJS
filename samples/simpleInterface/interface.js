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

	var UserLog = require('utils/UserLog');
	var AjaxUtils = require('utils/AjaxUtils');

	/*var SongModel = require('modules/core/src/SongModel');
	var ChordManager = require('modules/core/src/ChordManager');
	var ChordModel = require('modules/core/src/ChordModel');
	var NoteManager = require('modules/core/src/NoteManager');
	var NoteModel = require('modules/core/src/NoteModel');
	var TimeSignatureModel = require('modules/core/src/TimeSignatureModel');

	var SongModel_CSLJson = require('modules/converters/MusicCSLJson/src/SongModel_CSLJson');
	var SectionModel_CSLJson = require('modules/converters/MusicCSLJson/src/SectionModel_CSLJson');
	var BarModel_CSLJson = require('modules/converters/MusicCSLJson/src/BarModel_CSLJson');
	var ChordManager_CSLJson = require('modules/converters/MusicCSLJson/src/ChordManager_CSLJson');
	var ChordModel_CSLJson = require('modules/converters/MusicCSLJson/src/ChordModel_CSLJson');
	var NoteManager_CSLJson = require('modules/converters/MusicCSLJson/src/NoteManager_CSLJson');
	var NoteModel_CSLJson = require('modules/converters/MusicCSLJson/src/NoteModel_CSLJson');

	var SongView_chordSequence = require('modules/chordSequence/src/SongView_chordSequence');

	var SongModel_midiCSL = require('modules/MidiCSL/src/model/SongModel_midiCSL');
	var NoteModel_midiCSL = require('modules/MidiCSL/src/model/NoteModel_midiCSL');
	var PlayerModel_MidiCSL = require('modules/MidiCSL/src/model/PlayerModel_MidiCSL');
	var SongConverterMidi_MidiCSL = require('modules/MidiCSL/src/converters/SongConverterMidi_MidiCSL');

	var LSViewer = require('modules/LSViewer/src/LSViewer');*/

	var HarmonizerController = require('modules/Harmonizer/src/HarmonizerController');
	var HarmonizerView = require('modules/Harmonizer/src/HarmonizerView');

	var HarmonicAnalysisController = require('modules/HarmonicAnalysis/src/HarmonicAnalysisController');
	var HarmonicAnalysisView = require('modules/HarmonicAnalysis/src/HarmonicAnalysisView');

	var ConstraintModel = require('modules/Constraint/src/ConstraintModel');
	var ConstraintView = require('modules/Constraint/src/ConstraintView');
	var ConstraintController = require('modules/Constraint/src/ConstraintController');

	var ModuleManager = require('modules/ModuleManager/src/ModuleManager');
	var MainMenuModel = require('modules/MainMenu/src/MainMenuModel');
	var MainMenuController = require('modules/MainMenu/src/MainMenuController');
	var MainMenuView = require('modules/MainMenu/src/MainMenuView');

	var HistoryModel = require('modules/History/src/HistoryModel');
	var HistoryController = require('modules/History/src/HistoryController');
	var HistoryView = require('modules/History/src/HistoryView');

	var NoteSpaceManager = require('modules/NoteEdition/src/NoteSpaceManager');
	var NoteEditionView = require('modules/NoteEdition/src/NoteEditionView');
	var NoteEditionController = require('modules/NoteEdition/src/NoteEditionController');

	var ChordSpaceManager = require('modules/ChordEdition/src/ChordSpaceManager');
	var ChordEditionView = require('modules/ChordEdition/src/ChordEditionView');
	var ChordEditionController = require('modules/ChordEdition/src/ChordEditionController');

	var StructureEditionView = require('modules/StructureEdition/src/StructureEditionView');
	var StructureEditionController = require('modules/StructureEdition/src/StructureEditionController');
	var StructureEditionModel = require('modules/StructureEdition/src/StructureEditionModel');

	var FileEditionView = require('modules/FileEdition/src/FileEditionView');
	var FileEditionController = require('modules/FileEdition/src/FileEditionController');

	var SongModel = require('modules/core/src/SongModel');
	var SongModel_CSLJson = require('modules/converters/MusicCSLJson/src/SongModel_CSLJson');
	var testSongs = require('tests/test-songs');

	var LSViewer = require('modules/LSViewer/src/LSViewer');
	var SongView_chordSequence = require('modules/chordSequence/src/SongView_chordSequence');

	var PlayerModel_MidiCSL = require('modules/MidiCSL/src/model/PlayerModel_MidiCSL');
	var PlayerController = require('modules/MidiCSL/src/PlayerController_MidiCSL');
	var PlayerView = require('modules/MidiCSL/src/PlayerView_MidiCSL');

	var CursorModel = require('modules/Cursor/src/CursorModel');
	var CursorController = require('modules/Cursor/src/CursorController');
	var CursorView = require('modules/Cursor/src/CursorView');

	var TagManager = require('modules/Tag/src/TagManager');

	var myApp = {};

	var menuM = new MainMenuModel();
	var menuV = new MainMenuView(menuM, document.getElementById('menu-container'));
	var menuC = new MainMenuController(menuM, menuV);


	//myApp.historyV.activeView();
	/*myApp.historyM.addToHistory({},'Edit notes');
	myApp.historyM.addToHistory({});
	myApp.historyM.setCurrentPosition(1);*/

	// tried for unfolding
	// var songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.foldedSong);

	var songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);
	// initPlayerModule(songModel);

	var historyM = new HistoryModel();
	var historyV = new HistoryView();
	var historyC = new HistoryController(historyM, songModel);

	$.publish('ToHistory-add', {
		'item': testSongs.simpleLeadSheet,
		'title': 'Open song - ' + songModel.getTitle()
	});
	var option = {
		displayTitle: true,
		displayComposer: true,
		displaySection: true,
		displayBar: true,
		delimiterBar: "|",
		unfoldSong: false, // TODO unfoldSong is not working yet
		fillEmptyBar: true,
		fillEmptyBarCharacter: "%",
	};
	initChordSequenceModule($('#chordSequence1')[0], songModel, option);
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

	myApp.viewer = new LSViewer($("#canvas_container")[0]);

	$.subscribe('MainMenuView-render', function(el) {
		// Edit notes on view
		var cursorNoteController = initCursor(songModel.getComponent('notes'), songModel, 'notes', 'arrow');
		var noteSpaceManager = new NoteSpaceManager(songModel, cursorNoteController.model);
		//myApp.viewer.addDrawableModel(cursorNoteController.view, 11);

		// Edit notes menu
		var neV = new NoteEditionView();
		var neC = new NoteEditionController(songModel, cursorNoteController.model);

		// Edit chords on view
		var cursorChordController = initCursor(songModel.getSongTotalBeats(), songModel, 'chords', 'tab');
		cursorChordController.model.setEditable(false);
		var chordSpaceManager = new ChordSpaceManager(songModel, cursorChordController.model);
		// Edit chords menu
		var ceV = new ChordEditionView(undefined, cursorChordController.model);
		var ceC = new ChordEditionController(songModel, cursorChordController.model, ceV);

		// Harmonize menu
		var hV = new HarmonizerView();
		var hC = new HarmonizerController(songModel, hV);

		// Harmonic Analysis menu
		var haV = new HarmonicAnalysisView();
		var haC = new HarmonicAnalysisController(songModel, haV);


		// Constraint menu
		var cM = new ConstraintModel();
		var cV = new ConstraintView();
		var cC = new ConstraintController(songModel);

		// Edit bars menu
		var seV = new StructureEditionView();
		var seM = new StructureEditionModel();
		var seC = new StructureEditionController(songModel, cursorNoteController.model, seV, seM);

		// Edit files menu
		var feV = new FileEditionView();
		var feC = new FileEditionController(songModel, myApp.viewer.canvas);

		neV.render(undefined, true, function() {
			menuM.addMenu({
				title: 'Notes',
				view: neV,
				order: 2
			});
			menuC.activeMenu('Notes');
		});
		ceV.render(undefined, true, function() {
			menuM.addMenu({
				title: 'Chords',
				view: ceV,
				order: 3
			});
		});
		seV.render(undefined, true, function() {
			menuM.addMenu({
				title: 'Structure',
				view: seV,
				order: 4
			});
		});
		cV.render(undefined, false, function() {
			menuM.addMenu({
				title: 'Constraint',
				view: cV,
				order: 5
			});
			// menuC.activeMenu('Constraint');
		});
		hV.render(undefined, true, function() {
			menuM.addMenu({
				title: 'Harmonizer',
				view: hV,
				order: 6
			});
		});
		haV.render(undefined, true, function() {
			menuM.addMenu({
				title: 'Harmonic Analysis',
				view: haV,
				order: 7
			});
		});
		feV.render(undefined, true, function() {
			menuM.addMenu({
				title: 'File',
				view: feV,
				order: 1
			});
		});
		$.publish('ToViewer-draw', songModel);
	});


	function initChordSequenceModule(parentHTML, songModel, option) {
		var chordSequence = new SongView_chordSequence(parentHTML, songModel, option);
		chordSequence.draw();
	}

	function initPlayerModule(songModel) {
		// Create a song from testSong
		var player = new PlayerModel_MidiCSL(songModel);
		var pV = new PlayerView($('#player_test')[0], {
			displayMetronome: true,
			displayLoop: true,
			displayTempo: true,
			changeInstrument: true,
			autoload: false,
			progressBar: true
		});
		var pC = new PlayerController(player, pV);
	}

	function initCursor(listElement, songModel, id, keyType) {
		var cM = new CursorModel(listElement);
		var cV = new CursorView(cM, id, keyType);
		var cC = new CursorController(songModel, cM, cV);
		return cC;
	}
	window.myApp = myApp;
});