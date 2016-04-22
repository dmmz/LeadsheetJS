define([
	'modules/Comments/src/CommentsController',
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
	'modules/Edition/src/KeyboardManager',
	'jquery'
], function(
	Comments,
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
	KeyboardManager,
	$
) {
	function singleton(constructorFn){
		var instance;
		return {
			getInstance: function(){
				if (!instance) {
					instance = constructorFn(arguments);
				}
				return instance;
			}
		};
	};
	//constructors for different singletons:
	//
	var notesCursorConstructor = function(args){	
		var songModel = args[0];
		return cursorConstructor(songModel, 'notes');
	}
	var playerCursorConstructor = function(args){	
		var songModel = args[0];
		return cursorConstructor(songModel, 'player');
	}
	var cursorConstructor = function(songModel, id){
		return new Cursor(songModel.getComponent('notes'), id, 'arrow').model;
	};
	
	//singletons used
	var snglNotesCursor = (singleton)(notesCursorConstructor);
	var snglPlayerCursor = (singleton)(playerCursorConstructor);
	var snglNotesManager = (singleton)(function(args){
		var songModel = args[0];
		var viewer = args[1];
		return new NoteSpaceManager(snglNotesCursor.getInstance(songModel), viewer, 'NotesCursor', null, true, false);
	})
	var snglKeyBoardManager = (singleton)(function(){
		return new KeyboardManager(false);
	});

	//functions loading different modules

	function loadViewer(htmlElem, options, song){
		options = options || {};
		var viewer = new LSViewer(htmlElem, options);
		OnWindowResizer(song);
		return viewer;
	}

	function loadPlayer(options, songModel){
		function loadMidiPlayer(playerView, soundfontUrl){
			var player = new MidiCSL.PlayerModel_MidiCSL(songModel, soundfontUrl, {
				cursorModel: snglPlayerCursor.getInstance(songModel),
				cursorNoteModel: snglNotesCursor.getInstance(songModel)
			});
			new MidiCSL.PlayerController(player, playerView);
			return player;
		}
		var players = {};
		
		var useAudio = !!options.audio;
		var useMidi = options.midi && options.midi.soundfontUrl;

		var playerViewOptions = options.viewOptions;
		playerViewOptions.displaySwitch = useAudio && useMidi && options.audio.audioFile; //if audioFile is not defined, we do not load displayTypeSwitch
		playerViewOptions.tempo = !isNaN(songModel.getTempo()) ? songModel.getTempo() : null;
		
		var playerView = new PlayerView(options.HTMLElement, options.imgUrl, playerViewOptions);
		
		new NoteSpaceManager(snglPlayerCursor.getInstance(songModel), viewer, 'PlayerCursor', "#0AA000", false, false);
		
		if (options.interactive) {
			snglNotesManager.getInstance(songModel, viewer);
		}
		
		snglKeyBoardManager.getInstance();

		if (useMidi) {
			players.midiPlayer = loadMidiPlayer(playerView, options.midi.soundfontUrl);
		}

		if (useAudio) {
			$.publish('ToMidiPlayer-disable');
			var audioModule = new AudioModule(songModel, 
			{
				viewer: viewer,
				notesCursor: snglPlayerCursor.getInstance()
			});
			if (options.audio.audioFile) {
				audioModule.load(options.audio.audioFile, options.audio.tempo);
			}
			players.audioPlayer = audioModule;
		}
		return players;
	}

	function loadEdition(viewer, songModel, menuHTML, params){
		snglKeyBoardManager.getInstance();
		var menu, menuModel;
		if (menuHTML && (params.notes || params.chords || params.structure)){
			menu = new MainMenu(menuHTML);	
			menuModel = menu.model;
			menuModel.options = {};
			if (params.notes) {
				menuModel.options.notes = {
					active: true,
					menu: {
						title: 'Notes',
						order: 3
					},
					imgPath: params.imgUrl.notes
				};
			}
			if (params.chords) {
				menuModel.options.chords = {
					active: true,
					/// menu: {
					//	title: 'Chords',
					//	order: 4
					//},
					imgPath: params.imgUrl.chords,
					menu: false // if we don't want menu
				};
			}
			if (params.structure) {
				menuModel.options.structure = {
					active: true,
					menu: {
						title: 'Structure',
						order: 5
					},
					imgPath: params.imgUrl.structure
				};
			}
		}
		if (params.notes){
			params.snglNotesManager = snglNotesManager;
			params.snglNotesCursor = snglNotesCursor;
		}
		var returnObj = {
			edition: new Edition(viewer, songModel, menuModel, params),
		};
		if (menu) 		returnObj.menuController = menu.controller;
		if (menuModel) 	returnObj.menuModel = menuModel;
		return returnObj;		
	}
	
	//LJS object:
	//returns modules to be used by client
	var LJS = {
		Comments: Comments,
		//"chordSequence": chordSequence,
		converters: {
			MusicCSLJson: convertersMusicCSLJson,
			MusicXML: convertersMusicXML
		},
		core: core,
		LSViewer: LSViewer,
		Tag: TagManager,
		OnWindowResizer: OnWindowResizer,
		utils: utils,
		Tag: TagManager,
		Audio: AudioModule
	};
	/**
	 * initializes modules asked by 'params'
	 * @param  {Object} MusicCSLJSON Json object representing a lead sheet
	 * @param  {Object} params       parameters that determine which modules to load and their options
	 * @return {Object}              contains objects from loaded modules
	 */
	LJS.init = function(MusicCSLJSON, params) {
		if (MusicCSLJSON === undefined) {
			throw "missing MusicCLJSON song";
		}
		
		var songModel = SongModel_CSLJson.importFromMusicCSLJSON(MusicCSLJSON);
		var useViewer = params.viewer !== undefined;
		var usePlayer = params.player !== undefined;
		var useEdition = params.edition !== undefined;
		var modules = {songModel: songModel};

		// Viewer
		
		if (useViewer) {
			if (params.viewer.HTMLElement === undefined) {
				throw "Missing HTMLElement for viewer";
			}
			viewer = loadViewer(params.viewer.HTMLElement, params.viewer.viewOptions, songModel);
		}

		// Player
		if (usePlayer) {
			if (params.player.HTMLElement === undefined) {
				throw "Missing HTMLElement for player";
			}

			var players = loadPlayer(params.player, songModel);
			
			modules.audioPlayer = players.audioPlayer;
			modules.midiPlayer = players.midiPlayer;
		}

		if (useEdition) {
			var menuHTML = params.edition.menu !== undefined ? params.edition.menu.HTMLElement : false;
			var editionModule = loadEdition(viewer, songModel, menuHTML, params.edition);
			

			//menu	
			if (editionModule.menuController){
				editionModule.menuController.loadStateTab();
				if (editionModule.menuModel.getCurrentMenu() === undefined) {
					editionModule.menuController.activeMenu('Notes');
				}		
			}
			//history
			if (params.edition.history){
				if (!params.edition.history.HTMLElement){
					throw "Missing HTMLElement for history";		
				}
				var historyHTML = params.edition.history.HTMLElement;
				new HistoryC(songModel, historyHTML, null, true, false);
				$.publish('ToHistory-add', 'Open song - ' + songModel.getTitle());
			}
			var fileEdition = new FileEdition(songModel, viewer, params.edition.saveFunction, {saveButton:params.edition.saveButton, saveAsButton:params.edition.saveAsButton});
			
			if (editionModule.menuModel){
				editionModule.menuModel.addMenu({
					title: 'File',
					view: fileEdition.view,
					order: 1
				});
				editionModule.menuController.loadStateTab();
				editionModule.menuController.activeMenu('File');
			}
			
			modules.edition = editionModule.edition;
			modules.menuModel = editionModule.menuModel;
			modules.menuController = editionModule.menuController;
		}

		//tags
		if (params.tags){
			// TagManager take as argument your array of tags here call analysis, an array of color (here undefined because we use built in colors)
			new TagManager(songModel,  {notes: snglNotesManager.getInstance(songModel,viewer)}, params.tags, undefined, true, false);
		}

		if (useViewer){
			viewer.draw(songModel);
			modules.viewer = viewer;
		}
		if (usePlayer || useEdition || params.tags){
			modules.notesCursor = snglNotesCursor.getInstance(songModel);
			modules.noteSpaceManager = snglNotesManager.getInstance(songModel,viewer);
		}
		return modules;
	};



	/*LJS._loadChordSequence = function() {
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
	};*/

	


	return LJS;
});