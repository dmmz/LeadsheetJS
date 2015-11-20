define([
	'modules/AudioComments/src/AudioCommentsController',
	'modules/ChordEdition/src/ChordEdition',
	'modules/chordSequence/src/SongView_chordSequence',
	'modules/Constraint/src/Constraint',
	'modules/Cursor/src/Cursor',
	'modules/Edition/src/Edition',
	'modules/FileEdition/src/FileEdition',
	'modules/History/src/HistoryC',
	'modules/HarmonicAnalysis/src/HarmonicAnalysis',
	'modules/Harmonizer/src/Harmonizer',
	'modules/LSViewer/src/main',
	'modules/MainMenu/src/MainMenu',
	'modules/MidiCSL/src/main',
	'modules/NoteEdition/src/NoteEdition',
	'modules/NoteEdition/src/NoteSpaceManager',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/StructureEdition/src/StructureEdition',
	'modules/Wave/src/WaveController',
	'modules/PlayerView/src/PlayerView',
	'jquery'
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
	NoteSpaceManager,
	SongModel,
	SongModel_CSLJson,
	StructureEdition,
	Wave,
	PlayerView,
	$
) {
	var LJS = {};
	
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
			useAudio = !!(params.player.audio && params.player.audio.audioFile);
			
		}
		
		// Edition
		allowEdition = false;
		var editNotes, editChords, editStructure, saveFunction, imgUrlEdition, allowHistory;
		if (params.edition) {
			allowEdition = true;
			editNotes = (params.edition.notes !== undefined) ? params.edition.notes : true;
			editChords = (params.edition.chords !== undefined) ? params.edition.chords : true;
			editStructure = (params.edition.structure !== undefined) ? params.edition.structure : true;
			saveFunction = (params.edition.saveFunction !== undefined) ? params.edition.saveFunction : undefined;
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
					var fileEdition = new FileEdition(songModel, viewer, saveFunction);
					edition = LJS._loadEditionModules(viewer, songModel, editNotes, editChords, editStructure, menu, imgUrlEdition); // TODO menu shouldn't be required here
					cursorNoteModel = edition.cursorNote.model;

					menu.model.addMenu({
						title: 'File',
						view: fileEdition.view,
						order: 1
					});
					LJS._loadActiveMenuOrDefault(menu, 'File');

					// Harmonize menu
					if (params.harmonizer) {
						var harm = new Harmonizer(songModel, menu.model);
						menu.model.addMenu({
							title: 'Harmonizer',
							view: harm.view,
							order: 6
						});
					}

					if (editNotes && params.harmonicAnalysis) {
						// Harmonic Analysis menu
						var harmAn = new HarmonicAnalysis(songModel, edition.noteEdition.noteSpaceMng);
						menu.model.addMenu({
							title: 'Harmonic Analysis',
							view: harmAn.view,
							order: 7
						});
					}
				}
			} 

			if (!allowEdition || !editNotes) {
				loadedModules.noteSpaceMng = new NoteSpaceManager(cursorNoteModel, viewer);
			} else {
				loadedModules.noteSpaceMng = edition.noteEdition.noteSpaceMng;
			}
		}


		if (usePlayer) {

			//we load both MIDI and Audio modules (as this won't bother the user with external dependencies)
			
			playerViewOptions.displayTypeSwitch = useAudio && useMidi;


			loadedModules.playerView = new PlayerView(playerHTML, imgUrl, playerViewOptions);

			var cursorNoteModel = new Cursor(songModel.getComponent('notes'), 'notes', 'arrow').model;

			if (useMidi) {
				var disableOnload =  useAudio;
				loadedModules.midiPlayer = LJS._loadMidiPlayer(MidiCSL, songModel, soundfontUrl, loadedModules.playerView, cursorNoteModel, disableOnload);
			}

			if(useAudio){
				$.publish('ToMidiPlayer-disable');
				if (!params.player.audio.audioFile){
					throw "no audioFile specified";
				}
				var wave = LJS._loadAudioPlayer(Wave, songModel, viewer, cursorNoteModel); // audio player is use to get audio wave, it's why it needs viewer
				wave.load(params.player.audio.audioFile, 170, true);
				// loadedModules.audioPlayer = wave;	
			}
		
		}
		if (useViewer) {
			viewer.draw(songModel);
		}
		
		//TAG
		if (params.tag){
			
			var cursorNoteModel = new Cursor(songModel.getComponent('notes'), songModel, 'notes', 'arrow').model;
			var noteSpaceMng = new NoteSpaceManager(cursorNoteModel, viewer);
			var analysis = params.tag.analysis;
			// TagManager take as argument your array of tags here call analysis, an array of color (here undefined because we use built in colors)
			new tagManager.TagManager(songModel, noteSpaceMng, analysis, undefined, true, false);
			$.publish('ToViewer-draw', songModel); // redraw
		}

		/*if (typeof edition !== "undefined") {
			loadedModules.edition = edition;
		}*/
		return loadedModules;
	};



	LJS._loadHistory = function(songModel, HTMLElement) {
		new HistoryC(songModel, HTMLElement, 20, true, false);
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
		var viewer = new LSViewer.LSViewer(HTMLElement, viewerOptions);
		LSViewer.OnWindowResizer(songModel);
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
				menu: {
					title: 'Chords',
					order: 4
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

	LJS._loadMidiPlayer = function(MidiCSL, songModel, soundfontUrl, playerView, cursorModel, disableOnload) {
		
		var player = new MidiCSL.PlayerModel_MidiCSL(songModel, soundfontUrl, {
			'cursorModel': cursorModel
		});
		new MidiCSL.PlayerController(player, playerView);
		return player;
	};

	LJS._loadAudioPlayer = function(Wave, songModel, viewer, cursorModel) {
		var params = {
			showHalfWave: true,
			//drawMargins: true,
			topAudio: -120,
			heightAudio: 75,
			//file: '/tests/audio/solar.wav',
			//tempo: 170
		};
		var waveMng = new Wave(songModel, viewer, cursorModel, params);
		//$.publish('ToPlayer-disableAll');
		return waveMng;
	};


	LJS._loadActiveMenuOrDefault = function(menu, defaultMenu) {
		menu.controller.loadStateTab();
		if (typeof menu.model.getCurrentMenu() === "undefined") {
			menu.controller.activeMenu(defaultMenu);
		}
	};

	LJS._loadComments = function(waveMng, viewer, songModel) {
		var userSession = {
			name: 'Dani',
			id: '323324422',
			img: '/tests/img/dani-profile.jpg'
		};
		var audioComments = new AudioComments(waveMng, viewer, songModel, userSession);
		return audioComments;
	};

	LJS._generateUuid = function() {
		// Creating uniq id
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return (function() {
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		})();
	};

	return LJS;
});