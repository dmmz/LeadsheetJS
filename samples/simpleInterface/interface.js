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
	var $ = require('jquery');
	var LJS = require('LJS');
	console.log(LJS);

	var testSongs = require('tests/test-songs');
	// tried for unfolding
	// var songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.foldedSong);
	var songModel = LJS.converters.MusicCSLJson.SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);

	//var popIn = new LJS.PopIn.PopIn('Hello', 'Test<br />ok');
	//popIn.render();

	var menuHTML = document.getElementById('menu-container');
	var viewerHTML = $("#canvas_container")[0];
	var playerHTML = $('#player_test')[0];
	var userSession = {name:'Dani', id:'323324422',img:'/tests/img/dani-profile.jpg'};
	var audioComments;
	doLoadMidiPlayer = false; // only for debug false true
	allowEdition = true;
	if (allowEdition === false) {
		// Reading only
		var viewer = loadViewer(songModel, viewerHTML);
		var cursorNote = new LJS.Cursor(songModel.getComponent('notes'), songModel, 'notes', 'arrow');

		// Load players (midi and audio)
		loadMidiPlayer(songModel, edition.cursorNote.model, playerHTML, doLoadMidiPlayer);
		var wave = loadAudioPlayer(songModel, cursorNote.model, viewer);

		// Load menus
		var menu = loadMenu(menuHTML);
		var fileEdition = new LJS.FileEdition(songModel, viewer.canvas);
		menu.model.addMenu({
			title: 'File',
			view: fileEdition.view,
			order: 1
		});
		loadActiveMenuOrDefault(menu, 'File');
		audioComments = loadComments(wave, viewer, songModel, userSession);
		addComments(audioComments);
		viewer.draw(songModel);
	} else {
		// Read and write
		var viewer = loadViewer(songModel, viewerHTML);
		var menu = loadMenu(menuHTML);
		loadHistory(songModel);
		var edition = loadEditionModules(viewer, songModel, menu);
		// Load players (midi and audio)
		loadMidiPlayer(songModel, edition.cursorNote.model, playerHTML, doLoadMidiPlayer);
		var wave = loadAudioPlayer(songModel, edition.cursorNote.model, viewer);

		// Harmonize menu
		var harm = new LJS.Harmonizer(songModel, menu.model);
		// Harmonic Analysis menu
		var harmAn = new LJS.HarmonicAnalysis(songModel, edition.noteEdition.noteSpaceMng);
		// Edit files menu
		var fileEdition = new LJS.FileEdition(songModel, viewer.canvas);
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
		loadActiveMenuOrDefault(menu, 'File');
		audioComments = loadComments(wave, viewer, songModel, userSession);
		addComments(audioComments);
		viewer.draw(songModel);
	}

	function loadHistory(songModel) {
		new LJS.HistoryC(songModel, $('#rightPanel'), 20, true, false);
		$.publish('ToHistory-add', 'Open song - ' + songModel.getTitle());
	}

	function loadChordSequence() {
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
		new LJS.chordSequence($('#chordSequence1')[0], songModel, optionChediak);
	}

	function loadViewer(songModel, HTMLElement) {
		var viewer = new LJS.LSViewer.LSViewer(HTMLElement, {
			/*displayTitle: false,
			displayComposer: false,*/
			layer: true
		});
		LJS.LSViewer.OnWindowResizer(songModel);
		return viewer;
	}

	function loadMenu(HTMLElement) {
		var menu = new LJS.MainMenu(HTMLElement);
		return menu;
	}

	function loadEditionModules(viewer, songModel, menu) {
		//ALTERNATIVE WAY TO CREATE EDITION if not using edition constructor
		// var KeyboardManager = require('modules/Edition/src/KeyboardManager');
		// new KeyboardManager(true);

		// // Edit notes on view
		// var cursorNote = new LJS.Cursor(songModel.getComponent('notes'), 'notes', 'arrow');
		// var noteEdition = new LJS.NoteEdition(songModel, cursorNote.model, viewer, '/modules/NoteEdition/img');

		// // // Edit chords on view
		// var cursorChord = new LJS.Cursor(songModel.getSongTotalBeats(), 'chords', 'tab');
		// cursorChord.model.setEditable(false);

		// var chordEdition = new LJS.ChordEdition(songModel, cursorChord.model, viewer, '/modules/NoteEdition/img');
		//bars edition 
		//var structEdition = new LJS.StructureEdition(songModel, edition.cursorNote.model, '/modules/StructureEdition/img');

		var edition = new LJS.Edition.Edition(viewer, songModel, menu.model, {
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
			composer: {
				suggestions: ['Adam Smith', 'Kim Jong-il', 'Iñigo Errejón', 'Mia Khalifa', 'Jose Monge']
			}
		});
		return edition;
	}

	function loadMidiPlayer(songModel, cursorModel, HTMLPlayer, loadMidi) {
		// Create a song from testSong
		var pV = new LJS.MidiCSL.PlayerView(HTMLPlayer, '/modules/MidiCSL/img', {
			displayMetronome: true,
			displayLoop: true,
			displayTempo: true,
			changeInstrument: true,
			autoload: false,
			progressBar: true
		});
		if (typeof loadMidi === "undefined" || loadMidi === true) {
			var player = new LJS.MidiCSL.PlayerModel_MidiCSL(songModel, cursorModel, "../../external-libs/Midijs/soundfont/");
			var pC = new LJS.MidiCSL.PlayerController(player, pV);
		}
	}

	function loadAudioPlayer(songModel, cursorModel, viewer) {
		var params = {
			showHalfWave: true,
			//drawMargins: true,
			topAudio: -120,
			heightAudio: 75,
			file: '/tests/audio/solar.wav',
			tempo: 170
		};
		var waveMng = new LJS.Wave(songModel, cursorModel, viewer, params);
		$.publish('ToPlayer-disableAll');
		waveMng.enable();
		return waveMng;
	}


	function loadActiveMenuOrDefault(menu, defaultMenu) {
		menu.controller.loadStateTab();
		if (typeof menu.model.getCurrentMenu() === "undefined") {
			menu.controller.activeMenu(defaultMenu);
		}
	}

	function loadComments(waveMng, viewer, songModel, userSession) {
		//var serverAudioComments = new ServerAudioComments('idLeadsheet','idFile',userSession);
		var audioComments = new LJS.AudioComments(waveMng, viewer, songModel, userSession);
		return audioComments;
	}

	function addComments(audioComments) {
		audioComments.addComment({
			userName: 'Dani',
			id: '1234',
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