define([
	"modules/Cursor/src/Cursor",
	"modules/NoteEdition/src/NoteEdition",
	"modules/ChordEdition/src/ChordEdition",
	"modules/StructureEdition/src/StructureEdition",
	"modules/TextEdition/src/TextElementManager"
], function(Cursor, NoteEdition, ChordEdition, StructureEdition, TextElementManager) {
	/**
	 * Edition constructor
	 * @exports Edition
	 */
	function Edition(viewer, songModel, menuModel, params) {
		if (!params || !songModel) {
			throw "Edition - needs params";
		}
		
		//editing title
		var titleSuggs = params.title ? params.title.suggestions : null;
		new TextElementManager('titleView', 'Title', viewer, songModel, titleSuggs);
		var composerSuggs = params.composerSuggestions;
		new TextElementManager('composerView', 'Composer', viewer, songModel, composerSuggs);


		var cursorNotesModel, noteEdition, chordEdition, structEdition, imgPath;

		if (params.notes) {
			// Edit notes on view
			//cursorNote = new Cursor(songModel.getComponent('notes'), 'notes', 'arrow');
			cursorNotesModel = params.snglNotesCursor.getInstance(songModel);

			imgPath = menuModel ? menuModel.options.notes.imgPath : undefined;
			noteEdition = new NoteEdition(songModel, cursorNotesModel, viewer, imgPath, params.snglNotesManager);
			

			if (menuModel && menuModel.options.notes.menu) {
				menuModel.addMenu({
					title: menuModel.options.notes.menu.title,
					view: noteEdition.view,
					order: menuModel.options.notes.menu.order
				});
			}
		}
		if (params.chords) {
			// // Edit chords on view
			var cursorChord = new Cursor(songModel.getSongTotalBeats(), 'chords', 'tab');
			cursorChord.controller.model.setEditable(false);
			imgPath = menuModel ? menuModel.options.chords.imgPath : undefined;			
			chordEdition = new ChordEdition(songModel, cursorChord.controller.model, viewer, imgPath);
			
			if (menuModel && menuModel.options.chords.menu) {
				menuModel.addMenu({
					title: menuModel.options.chords.menu.title,
					view: chordEdition.view,
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
			var structEdition = new StructureEdition(songModel, params.snglNotesCursor.getInstance(), imgPath);

			if (menuModel && menuModel.options.structure.menu) {
				menuModel.addMenu({
					title: menuModel.options.structure.menu.title,
					view: structEdition.view,
					order: menuModel.options.structure.menu.order
				});
			}
		}
		return {
			noteEdition: noteEdition,
			chordEdition: chordEdition,
			structEdition: structEdition,
			cursorChord: cursorChord,
			notesCursor: cursorNotesModel
		};
	}
	return Edition;
});