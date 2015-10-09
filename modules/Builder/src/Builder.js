define([
	"modules/AudioComments/src/AudioCommentsController",
	"modules/ChordEdition/src/ChordEdition",
	"modules/chordSequence/src/SongView_chordSequence",
	"modules/Constraint/src/Constraint",
	"modules/Cursor/src/Cursor",
	"modules/Edition/src/Edition",
	"modules/FileEdition/src/FileEdition",
	"modules/History/src/HistoryC",
	"modules/HarmonicAnalysis/src/HarmonicAnalysis",
	"modules/Harmonizer/src/Harmonizer",
	"modules/LSViewer/src/main",
	"modules/MainMenu/src/MainMenu",
	"modules/MidiCSL/src/main",
	"modules/NoteEdition/src/NoteEdition",
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	"modules/StructureEdition/src/StructureEdition",
	"modules/Wave/src/WaveController",
	"jquery"
], function(
	AudioComments,
	ChordEdition,
	chordSequence,
	Constraint,
	Cursor,
	Edition,
	FileEdition,
	HistoryC,
	HarmonicAnalysis,
	Harmonizer,
	LSViewer,
	MainMenu,
	MidiCSL,
	NoteEdition,
	SongModel,
	SongModel_CSLJson,
	StructureEdition,
	Wave,
	$
) {
	var Builder = {};
	Builder.easyInit = function(name, MusicCSLJSON, parentHTML, params) {
		console.log(name, MusicCSLJSON, parentHTML, params);
	};
	Builder.init = function(MusicCSLJSON, params) {
		if (typeof MusicCSLJSON === "undefined" || typeof params === "undefined") {
			return;
		}

		/**
		 * In first Part we read options
		 */
		// Viewer
		var useViewer = false;
		if (typeof params.viewer !== "undefined") {
			if (typeof params.viewer.HTMLElement !== "undefined") {
				useViewer = true;
				var viewerHTML = params.viewer.HTMLElement;
				var viewerOptions = (typeof params.viewer.viewOptions !== "undefined") ? params.viewer.viewOptions : {};
			}
		}

		// Player
		var usePlayer = false;
		if (typeof params.player !== "undefined") {
			if (typeof params.player.HTMLElement !== "undefined") {
				usePlayer = true;
				var playerHTML = params.player.HTMLElement;
				var soundfontUrl = (typeof params.player.soundfontUrl !== "undefined") ? params.player.soundfontUrl : undefined;
				var imgUrl = (typeof params.player.imgUrl !== "undefined") ? params.player.imgUrl : undefined;
				var playerViewOptions = (typeof params.player.viewOptions !== "undefined") ? params.player.viewOptions : {};
			}
			if (typeof params.player.useAudio !== "undefined") {
				var useAudio = (typeof params.player.useAudio !== "undefined") ? params.player.useAudio : false;
			}
		}

		// Edition
		allowEdition = false;
		if (typeof params.edition !== "undefined") {
			allowEdition = true;
			var editNotes = (typeof params.edition.notes !== "undefined") ? params.edition.notes : true;
			var editChords = (typeof params.edition.chords !== "undefined") ? params.edition.chords : true;
			var editStructure = (typeof params.edition.structure !== "undefined") ? params.edition.structure : true;
			var imgUrlEdition = params.edition.imgUrl || {};
			var allowHistory = false;
			if (typeof params.history !== "undefined") {
				if (params.history.enable) {
					allowHistory = true;
					// if not precised, then it doesn't display history but keyboard ctrl+z and y are working
					historyHTML = (typeof params.history.HTMLElement !== "undefined") ? params.edition.history.HTMLElement : undefined;
				}
			}
		}

		// Menu
		var useMenu = false;
		if (typeof params.menu !== "undefined") {
			if (typeof params.menu.HTMLElement !== "undefined") {
				useMenu = true;
				var menuHTML = params.menu.HTMLElement;
			}
		}

		var loadedModules = {}; // we store loaded modules in this object, this object is return for developer
		/**
		 * On second Part we use options to initialize modules
		 */
		var songModel = SongModel_CSLJson.importFromMusicCSLJSON(MusicCSLJSON);
		loadedModules.songModel = songModel;
		doLoadMidiPlayer = true; // only for debug false true

		var viewer;
		if (useViewer) {
			// Reading only
			viewer = Builder._loadViewer(songModel, viewerHTML, viewerOptions);
			loadedModules.viewer = viewer;
			if (useMenu) {
				// Load menus
				var menu = Builder._loadMenu(menuHTML);
				loadedModules.menu = menu;
			}
			if (allowEdition) {
				if (allowHistory) {
					Builder._loadHistory(songModel, historyHTML);
				}
				if (useMenu) {
					// Edit files menu
					var fileEdition = new FileEdition(songModel, viewer.canvas);
					var edition = Builder._loadEditionModules(viewer, songModel, editNotes, editChords, editStructure, menu, imgUrlEdition); // TODO menu shouldn't be required here
					// Harmonize menu
					if (params.harmonizer) {
						var harm = new Harmonizer(songModel, menu.model);
						menu.model.addMenu({
							title: 'Harmonizer',
							view: harm.view,
							order: 5
						});
					}

					if (editNotes && params.harmonicAnalysis) {
						// Harmonic Analysis menu
						var harmAn = new HarmonicAnalysis(songModel, edition.noteEdition.noteSpaceMng);
						menu.model.addMenu({
							title: 'Harmonic Analysis',
							view: harmAn.view,
							order: 6
						});
					}

				}
			}
			if (useMenu) {
				var fileEdition = new FileEdition(songModel, viewer.canvas);
				menu.model.addMenu({
					title: 'File',
					view: fileEdition.view,
					order: 1
				});
				Builder._loadActiveMenuOrDefault(menu, 'File');
			}
		} else {
			viewer = undefined;
		}
		if (usePlayer) {
			var cursorNoteModel;
			if (typeof edition !== "undefined" && typeof edition.cursorNote !== "undefined") {
				cursorNoteModel = edition.cursorNote.model;
			} else {
				cursorNoteModel = (new Cursor(songModel.getComponent('notes'), songModel, 'notes', 'arrow')).model;
			}
			// Load players (midi and audio)
			Builder._loadMidiPlayer(songModel, playerHTML, doLoadMidiPlayer, soundfontUrl, imgUrl, cursorNoteModel, playerViewOptions);
			if (useViewer && useAudio) {
				var wave = Builder._loadAudioPlayer(songModel, viewer, cursorNoteModel); // audio player is use to get audio wave, it's why it needs viewer
				loadedModules.audioPlayer = wave;

				var audioComments = Builder._loadComments(wave, viewer, songModel);
				loadedModules.audioComments = audioComments;
			}
		}
		if (useViewer) {
			viewer.draw(songModel);
		}

		if (typeof edition !== "undefined") {
			loadedModules.edition = edition;
		}
		return loadedModules;
	};



	Builder._loadHistory = function(songModel, HTMLElement) {
		new HistoryC(songModel, HTMLElement, 20, true, false);
		$.publish('ToHistory-add', 'Open song - ' + songModel.getTitle());
	};

	Builder._loadChordSequence = function() {
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
		new chordSequence($('#chordSequence1')[0], songModel, optionChediak);
	};

	Builder._loadViewer = function(songModel, HTMLElement, viewerOptions) {
		var viewer = new LSViewer.LSViewer(HTMLElement, viewerOptions);
		LSViewer.OnWindowResizer(songModel);
		return viewer;
	};

	Builder._loadMenu = function(HTMLElement) {
		var menu = new MainMenu(HTMLElement);
		return menu;
	};

	Builder._loadEditionModules = function(viewer, songModel, editNotes, editChords, editStructure, menu, imgUrl) {
		//ALTERNATIVE WAY TO CREATE EDITION if not using edition constructor
		// var KeyboardManager = require('modules/Edition/src/KeyboardManager');
		// new KeyboardManager(true);

		// // Edit notes on view
		// var cursorNote = new Cursor(songModel.getComponent('notes'), 'notes', 'arrow');
		// var noteEdition = new NoteEdition(songModel, cursorNote.model, viewer, '/modules/NoteEdition/img');

		// // // Edit chords on view
		// var cursorChord = new Cursor(songModel.getSongTotalBeats(), 'chords', 'tab');
		// cursorChord.model.setEditable(false);

		// var chordEdition = new ChordEdition(songModel, cursorChord.model, viewer, '/modules/NoteEdition/img');
		//bars edition 
		//var structEdition = new StructureEdition(songModel, edition.cursorNote.model, '/modules/StructureEdition/img');

		var modules = {};

		if (editNotes) {
			modules.notes = {
				active: true,
				menu: {
					title: 'Notes',
					order: 2
				},
				imgPath: imgUrl.notes
			};
		}
		if (editChords) {
			modules.chords = {
				active: true,
				menu: {
					title: 'Chords',
					order: 3
				},
				imgPath: imgUrl.chords
					// menu: false /* if we don't want menu*/
			};
		}
		if (editStructure) {
			modules.structure = {
				active: true,
				menu: {
					title: 'Structure',
					order: 4
				},
				imgPath: imgUrl.structure
			};
		}
		modules.composer = {
			suggestions: ['Miles Davis', 'John Coltrane', 'Bill Evans', 'Charlie Parker', 'Thelonious Monk']
		};
		var edition = new Edition(viewer, songModel, menu.model, modules);
		return edition;
	};

	Builder._loadMidiPlayer = function(songModel, HTMLPlayer, loadMidi, soundfontUrl, imgUrl, cursorModel, playerOptions) {
		// Create a song from testSong
		var pV = new MidiCSL.PlayerView(HTMLPlayer, imgUrl, playerOptions);
		if (typeof loadMidi === "undefined" || loadMidi === true) {
			var player = new MidiCSL.PlayerModel_MidiCSL(songModel, soundfontUrl, {
				'cursorModel': cursorModel
			});
			var pC = new MidiCSL.PlayerController(player, pV);
		}
	};

	Builder._loadAudioPlayer = function(songModel, viewer, cursorModel) {
		var params = {
			showHalfWave: true,
			//drawMargins: true,
			topAudio: -120,
			heightAudio: 75,
			//file: '/tests/audio/solar.wav',
			//tempo: 170
		};
		var waveMng = new Wave(songModel, viewer, cursorModel, params);
		$.publish('ToPlayer-disableAll');
		waveMng.enable();
		return waveMng;
	};


	Builder._loadActiveMenuOrDefault = function(menu, defaultMenu) {
		menu.controller.loadStateTab();
		if (typeof menu.model.getCurrentMenu() === "undefined") {
			menu.controller.activeMenu(defaultMenu);
		}
	};

	Builder._loadComments = function(waveMng, viewer, songModel) {
		var userSession = {
			name: 'Dani',
			id: '323324422',
			img: '/tests/img/dani-profile.jpg'
		};
		var audioComments = new AudioComments(waveMng, viewer, songModel, userSession);
		return audioComments;
	};


	return Builder;
});