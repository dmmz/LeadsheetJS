define([
	'underscore',
	"modules/Cursor/src/Cursor",
	"modules/NoteEdition/src/NoteEdition",
	"modules/ChordEdition/src/ChordEdition",
	"modules/StructureEdition/src/StructureEdition",
	"modules/TextEdition/src/TextElementManager",
], function(_, Cursor, NoteEdition, ChordEdition, StructureEdition, TextElementManager) {
	/**
	 * Edition constructor
	 * @exports Edition
	 */
	function Edition(viewer, songModel, menuModel, params) {
		if (!params || !songModel) {
			throw "Edition - needs params";
		}
		var self = this;
		self.modules = {};
		//editing title
		var titleSuggs = params.title ? params.title.suggestions : null;
		self.modules.titleTextElement = new TextElementManager('titleView', 'Title', viewer, songModel, titleSuggs);
		var composerSuggs = params.composerSuggestions;
		self.modules.composerTextElement = new TextElementManager('composerView', 'Composer', viewer, songModel, composerSuggs);

		var cursorNotesModel, chordEdition, structEdition, imgPath;

		if (params.notes) {
			// Edit notes on view
			cursorNotesModel = params.snglNotesCursor.getInstance(songModel);

			imgPath = menuModel ? menuModel.options.notes.imgPath : undefined;
			self.modules.noteEdition = new NoteEdition(songModel, cursorNotesModel, viewer, imgPath, params.snglNotesManager);			

			if (menuModel && menuModel.options.notes.menu) {
				menuModel.addMenu({
					title: menuModel.options.notes.menu.title,
					view: self.modules.noteEdition.view,
					order: menuModel.options.notes.menu.order
				});
			}
		}
		if (params.chords) {
			// Edit chords on view
			self.modules.cursorChord = new Cursor(songModel.getSongTotalBeats(), 'chords', 'tab');
			imgPath = menuModel ? menuModel.options.chords.imgPath : undefined;			
			self.modules.chordEdition = new ChordEdition(songModel, self.modules.cursorChord.controller.model, viewer, imgPath);
			
			if (menuModel && menuModel.options.chords.menu) {
				menuModel.addMenu({
					title: menuModel.options.chords.menu.title,
					view: self.modules.chordEdition.view,
					order: menuModel.options.chords.menu.order
				});
			}
		}

		if (params.structure) {
			if (!params.notes) {
				throw "Edition: to add structure, cursor of notes edition needed";
			}
			//bars edition 
			imgPath = menuModel ? menuModel.options.structure.imgPath : undefined;			
			self.modules.structEdition = new StructureEdition(songModel, params.snglNotesCursor.getInstance(), imgPath);

			if (menuModel && menuModel.options.structure.menu) {
				menuModel.addMenu({
					title: menuModel.options.structure.menu.title,
					view: self.modules.structEdition.view,
					order: menuModel.options.structure.menu.order
				});
			}
		}
		// desactivate edition on all loaded modules implementing interface EditionModuleInterface
		self.setModulesEditable = function(editable) {
			for (var i in self.modules) {
				if (_.isFunction(self.modules[i].setEditable)) {
					self.modules[i].setEditable(editable);
				}
				if (_.isFunction(self.modules[i].disable)) {
					self.modules[i].disable();
				}
			}
		};
		$.subscribe('ToEdition-enable', function() {
			self.setModulesEditable(true);
		});
		$.subscribe('ToEdition-disable', function() {
			self.setModulesEditable(false);
		});
		return self.modules;
	}
	return Edition;
});