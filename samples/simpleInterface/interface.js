//Require and Qunit working, done following  http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests
require.config({
	baseUrl: "../../",
	paths: {
		jquery: 'external-libs/jquery-2.1.0.min',
		qunit: 'external-libs/qunit/qunit',
		vexflow_helper: 'external-libs/vexflow_test_helpers',
		vexflow: 'external-libs/vexflow-min',
		Midijs: 'external-libs/Midijs/midijs.min',
		pubsub: 'external-libs/tiny-pubsub.min',
		mustache: 'external-libs/mustache',
		bootstrap: 'external-libs/bootstrap/bootstrap.min',
		slider: 'external-libs/bootstrap/bootstrap-slider',
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

	var UserLog = require('utils/Userlog');
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

	var SongModel = require('modules/core/src/SongModel');
	var SongModel_MidiCSL = require('modules/MidiCSL/src/model/SongModel_MidiCSL');
	var NoteModel_MidiCSL = require('modules/MidiCSL/src/model/NoteModel_MidiCSL');
	var SongConverterMidi_MidiCSL = require('modules/MidiCSL/src/converters/SongConverterMidi_MidiCSL');
	var SongModel_CSLJson = require('modules/converters/MusicCSLJson/src/SongModel_CSLJson');
	var testSongs = require('tests/test-songs');
	var PlayerModel_MidiCSL = require('modules/MidiCSL/src/model/PlayerModel_MidiCSL');
	var PlayerController = require('modules/MidiCSL/src/PlayerController_MidiCSL');
	var PlayerView = require('modules/MidiCSL/src/PlayerView_MidiCSL');

	var myApp = {};

	var menuM = new MainMenuModel();
	var menuV = new MainMenuView(menuM, document.getElementById('main-container'));
	var menuC = new MainMenuController(menuM, menuV);

	myApp.historyM = new HistoryModel();
	myApp.historyV = new HistoryView(myApp.historyM);
	myApp.historyC = new HistoryController(myApp.historyM, myApp.historyV);

	//myApp.historyV.activeView();
	/*myApp.historyM.addToHistory({},'Edit notes');
	myApp.historyM.addToHistory({});
	myApp.historyM.setCurrentPosition(1);*/

	$.subscribe('MainMenuView-render', function(el) {
		var hV = new HarmonizerView();
		var hC = new HarmonizerController(hV);
		hV.render(undefined, true, function() {
			menuM.addMenu({
				title: 'Harmonizer',
				view: hV
			});
		});

		var cM = new ConstraintModel();
		var cV = new ConstraintView(cM);
		var cC = new ConstraintController(cM, cV);
		cV.render(undefined, false, function() {
			menuM.addMenu({
				title: 'Constraint',
				view: cV
			});
			menuC.activeMenu('Constraint');
		});
	});

	initPlayerModule();
	function initPlayerModule() {
		// Create a song from testSong
		var songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet, new SongModel());

		// Convert songmodel to a readable model that we can insert in SongModel_MidiCSL
		var midiSong = SongConverterMidi_MidiCSL.exportToMidiCSL(songModel);
		myApp.midiSongModel = new SongModel_MidiCSL({
			'song': midiSong
		});

		var player = new PlayerModel_MidiCSL();
		var pV = new PlayerView(player, $('#player_test')[0], {displayMetronome:true, displayLoop:true, displayTempo:true, changeInstrument:true});
		var pC = new PlayerController(player, pV);
	}

	window.myApp = myApp;
});