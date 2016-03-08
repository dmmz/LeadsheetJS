define([
	'modules/AudioComments/src/AudioCommentsController',
	'modules/ChordEdition/src/ChordEdition',
	'modules/chordSequence/src/SongView_chordSequence',
	"modules/converters/MusicCSLJson/src/main",
	"modules/converters/MusicXML/src/main",
	"modules/core/src/main", // most important module
	'modules/Cursor/src/Cursor',
	'modules/Edition/src/Edition',
	'modules/FileEdition/src/FileEdition',
	'modules/History/src/HistoryC',
	'modules/LSViewer/src/LSViewer',
	'modules/LSViewer/src/OnWindowResizer',
	'modules/MainMenu/src/MainMenu',
	'modules/MidiCSL/src/main',
	'modules/NoteEdition/src/NoteEdition',
	'modules/NoteEdition/src/NoteSpaceManager',
	'modules/PlayerView/src/PlayerView',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/StructureEdition/src/StructureEdition',
	'modules/Tag/src/TagManager',
	'utils/main',
	'modules/Audio/src/AudioModule',
	'jquery'
], function(
	AudioComments,
	ChordEdition,
	chordSequence,
	convertersMusicCSLJson,
	convertersMusicXML,
	core,
	Cursor,
	Edition,
	FileEdition,
	HistoryC,
	LSViewer,
	OnWindowResizer,
	MainMenu,
	MidiCSL,
	NoteEdition,
	NoteSpaceManager,
	PlayerView,
	SongModel,
	SongModel_CSLJson,
	StructureEdition,
	TagManager,
	utils,
	AudioModule,
	$
) {
	var LJS = {
		"AudioComments": AudioComments,
		"ChordEdition": ChordEdition,
		"chordSequence": chordSequence,
		"converters": {
			"MusicCSLJson": convertersMusicCSLJson,
			"MusicXML": convertersMusicXML
		},
		"core": core,
		"Cursor": Cursor,
		"Edition": Edition,
		"FileEdition": FileEdition,
		"HistoryC": HistoryC,
		"LSViewer": LSViewer,
		"OnWindowResizer": OnWindowResizer,
		"MainMenu": MainMenu,
		"MidiCSL": MidiCSL,
		"NoteEdition": NoteEdition,
		"StructureEdition": StructureEdition,
		"Tag": TagManager,
		//"Wave": Wave,
		"utils": utils
	};

	LJS.init = function(MusicCSLJSON, params) {
		if (MusicCSLJSON === undefined) {
			throw "missing MusicCLJSON song";
		}


		/**
		 * In first Part we read options
		 */
		// Viewer
		var useViewer = false;
		var viewerHTML,
			viewerOptions;

		if (params.viewer !== undefined) {
			if (params.viewer.HTMLElement === undefined) {
				throw "Missing HTMLElement for viewer";
			}

			useViewer = true;
			viewerHTML = params.viewer.HTMLElement;
			viewerOptions = params.viewer.viewOptions || {};

		}

		// Player
		var usePlayer = false;
		var playerHTML, soundfontUrl, imgUrl, playerViewOptions, useAudio, useMidi;
		if (params.player !== undefined) {
			if (params.player.HTMLElement === undefined) {
				throw "Missing HTMLElement for player";
			}

			usePlayer = true;
			playerHTML = params.player.HTMLElement;
			imgUrl = params.player.imgUrl || undefined;
			playerViewOptions = params.player.viewOptions || {};

			if (params.player.midi && params.player.midi.soundfontUrl) {
				soundfontUrl = params.player.midi.soundfontUrl;
				useMidi = true;
			}
			useAudio = !!(params.player.audio);

		}

		// Edition
		allowEdition = false;
		var editNotes, editChords, editStructure, saveFunction, imgUrlEdition, allowHistory, buttonSave, buttonSaveAs;
		if (params.edition) {
			allowEdition = true;
			editNotes = (params.edition.notes !== undefined) ? params.edition.notes : true;
			editChords = (params.edition.chords !== undefined) ? params.edition.chords : true;
			editStructure = (params.edition.structure !== undefined) ? params.edition.structure : true;
			saveFunction = (params.edition.saveFunction !== undefined) ? params.edition.saveFunction : undefined;
			saveButton = (params.edition.saveButton !== undefined) ? params.edition.saveButton : true;
			saveAsButton = (params.edition.saveAsButton !== undefined) ? params.edition.saveAsButton : true;
			imgUrlEdition = params.edition.imgUrl || {};
			allowHistory = false;
			if (params.edition.history !== undefined) {
				if (params.edition.history.enable) {
					allowHistory = true;
					// if not precised, then it doesn't display history but keyboard ctrl+z and y are working
					historyHTML = (typeof params.edition.history.HTMLElement !== "undefined") ? params.edition.history.HTMLElement : undefined;
				}
			}
		}

		// Menu
		var useMenu = false;
		var menuHTML;
		if (typeof params.menu !== "undefined") {
			if (typeof params.menu.HTMLElement !== "undefined") {
				useMenu = true;
				menuHTML = params.menu.HTMLElement;
			}
		}

		var loadedModules = {}; // we store loaded modules in this object, this object is return for developer

		// On second Part we use options to initialize modules

		var songModel = SongModel_CSLJson.importFromMusicCSLJSON(MusicCSLJSON);
		loadedModules.songModel = songModel;
		doLoadMidiPlayer = true; // only for debug false true

		var viewer, edition, menu;
		var cursorNoteModel;
		if (useViewer) {

			// Reading only
			viewer = LJS._loadViewer(songModel, viewerHTML, viewerOptions);
			loadedModules.viewer = viewer;
			if (useMenu) {
				// Load menus
				menu = LJS._loadMenu(menuHTML);
				loadedModules.menu = menu;
			}
			if (allowEdition) {
				if (allowHistory) {
					LJS._loadHistory(songModel, historyHTML);
				}
				if (useMenu) {
					// Edit files menu
					var fileEdition = new FileEdition(songModel, viewer, saveFunction, {saveButton:saveButton, saveAsButton:saveAsButton});
					edition = LJS._loadEditionModules(viewer, songModel, editNotes, editChords, editStructure, menu, imgUrlEdition); // TODO menu shouldn't be required here
					cursorNoteModel = edition.cursorNote.model;

					menu.model.addMenu({
						title: 'File',
						view: fileEdition.view,
						order: 1
					});
					LJS._loadActiveMenuOrDefault(menu, 'File');

				}
			} else {
				//for player and tags
				cursorNoteModel = new Cursor(songModel.getComponent('notes'), songModel, 'notes', 'arrow').model;
			}

			if (params.tags && (!allowEdition || !editNotes)) {
				//when we need tags and there is no edition
				loadedModules.noteSpaceMng = new NoteSpaceManager(cursorNoteModel, viewer);
			} else if (allowEdition && edition.noteEdition) {
				loadedModules.noteSpaceMng = edition.noteEdition.noteSpaceMng;
			}
		}


		if (usePlayer) {

			//we load both MIDI and Audio modules (as this won't bother the user with external dependencies)

			playerViewOptions.displayTypeSwitch = useAudio && useMidi && params.player.audio.audioFile; //if audioFile is not defined, we do not load displayTypeSwitch
			if (!isNaN(songModel.getTempo())) {
				playerViewOptions.tempo = songModel.getTempo();
			}

			loadedModules.playerView = new PlayerView(playerHTML, imgUrl, playerViewOptions);
			var cursorPlayerModel = new Cursor(songModel.getComponent('notes'), songModel, 'notes', 'arrow').model;
			new NoteSpaceManager(cursorPlayerModel, viewer, 'PlayerCursor', "#0AA000", false, false);


			if (useMidi) {
				loadedModules.midiPlayer = LJS._loadMidiPlayer(MidiCSL, songModel, soundfontUrl, loadedModules.playerView, cursorPlayerModel, cursorNoteModel);
			}

			if (useAudio) {
				$.publish('ToMidiPlayer-disable');

				var audioModule = LJS._loadAudioPlayer(AudioModule, songModel, viewer, cursorPlayerModel); // audio player is use to get audio wave, it's why it needs viewer
				if (params.player.audio.audioFile) {
					audioModule.load(params.player.audio.audioFile, params.player.audio.tempo);
				}
				loadedModules.audioPlayer = audioModule;
				loadedModules.cursorPlayerModel = cursorPlayerModel;
			}

		}
		//TAG
		if (params.tags) {

			// TagManager take as argument your array of tags here call analysis, an array of color (here undefined because we use built in colors)
			new TagManager(songModel, loadedModules.noteSpaceMng, params.tags, undefined, true, false);
			//$.publish('ToViewer-draw', songModel); // redraw
		}
		if (useViewer) {
			viewer.draw(songModel);
		}

		//edition is used outside
		if (typeof edition !== "undefined") {
			loadedModules.edition = edition;
		}
		return loadedModules;
	};



	LJS._loadHistory = function(songModel, HTMLElement) {
		//new HistoryC(songModel, HTMLElement, {maxHistoryLength:2}, true, false);
		new HistoryC(songModel, HTMLElement, null, true, false);
		$.publish('ToHistory-add', 'Open song - ' + songModel.getTitle());
	};

	LJS._loadChordSequence = function() {
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

	LJS._loadViewer = function(songModel, HTMLElement, viewerOptions) {
		var viewer = new LSViewer(HTMLElement, viewerOptions);
		OnWindowResizer(songModel);
		return viewer;
	};

	LJS._loadMenu = function(HTMLElement) {
		var menu = new MainMenu(HTMLElement);
		return menu;
	};

	LJS._loadEditionModules = function(viewer, songModel, editNotes, editChords, editStructure, menu, imgUrl) {
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
					order: 3
				},
				imgPath: imgUrl.notes
			};
		}
		if (editChords) {
			modules.chords = {
				active: true,
				/*menu: {
					title: 'Chords',
					order: 4
				},*/
				imgPath: imgUrl.chords,
				menu: false // if we don't want menu
			};
		}
		if (editStructure) {
			modules.structure = {
				active: true,
				menu: {
					title: 'Structure',
					order: 5
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

	LJS._loadMidiPlayer = function(MidiCSL, songModel, soundfontUrl, playerView, cursorModel, cursorNoteModel) {

		var player = new MidiCSL.PlayerModel_MidiCSL(songModel, soundfontUrl, {
			cursorModel: cursorModel,
			cursorNoteModel: cursorNoteModel
		});
		new MidiCSL.PlayerController(player, playerView);
		return player;
	};

	LJS._loadAudioPlayer = function(AudioModule, songModel, viewer, cursorModel) {
		
		return new AudioModule(songModel, 
			{
				viewer: viewer,
				notesCursor: cursorModel
			});
		//$.publish('ToPlayer-disableAll');
	};


	LJS._loadActiveMenuOrDefault = function(menu, defaultMenu) {
		menu.controller.loadStateTab();
		if (typeof menu.model.getCurrentMenu() === "undefined") {
			menu.controller.activeMenu(defaultMenu);
		}
	};

	// LJS._loadComments = function(waveMng, viewer, songModel) {
	// 	var userSession = {
	// 		name: 'Dani',
	// 		id: '323324422',
	// 		img: '/tests/img/dani-profile.jpg'
	// 	};
	// 	var audioComments = new AudioComments(waveMng, viewer, songModel, userSession);
	// 	return audioComments;
	// };

	// LJS._generateUuid = function() {
	// 	// Creating uniq id
	// 	function s4() {
	// 		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	// 	}
	// 	return (function() {
	// 		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	// 	})();
	// };

	return LJS;
});