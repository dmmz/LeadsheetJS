
define([
	"modules/Edition/src/KeyboardManager",
	"modules/Cursor/src/Cursor",
	"modules/NoteEdition/src/NoteEdition",
	"modules/ChordEdition/src/ChordEdition",
	"modules/StructureEdition/src/StructureEdition",
	"modules/TextEdition/src/TextElementManager"
], function(KeyboardManager, Cursor, NoteEdition, ChordEdition, StructureEdition, TextElementManager) {

	function Edition(viewer, songModel, menuModel, params) {
		if (!params) {
			throw "Edition - need params";
		}
		this.noteEdition = null; //noteEdition property, as we want it accessible from outside (e.g. for harmonicAnalysis)


		new KeyboardManager(false);
		
		//editing title
		
		var titleSuggs = params.title ? params.title.suggestions : null;
		new TextElementManager('titleView', 'Title', viewer, songModel,titleSuggs);

		var composerSuggs = params.composer ? params.composer.suggestions : null;
		new TextElementManager('composerView', 'Composer', viewer, songModel, composerSuggs);
		

		var cursorNote;
		if (params.notes) {
			// Edit notes on view
			cursorNote = new Cursor(songModel.getComponent('notes'), 'notes', 'arrow');
			this.noteEdition = new NoteEdition(songModel, cursorNote.controller.model, viewer, params.notes.imgPath); 
			this.cursorNote = cursorNote;
			
			if (menuModel && params.notes.menu){
				menuModel.addMenu({
					title: params.notes.menu.title,
					view: this.noteEdition.view,
					order: params.notes.menu.order
				});
			}

		}
		if (params.chords) {
			// // Edit chords on view
			var cursorChord = new Cursor(songModel.getSongTotalBeats(), 'chords', 'tab');
			cursorChord.controller.model.setEditable(false);
			var chordEdition = new ChordEdition(songModel, cursorChord.controller.model, viewer, params.chords.imgPath);
			this.cursorChord = cursorChord;
			
			if (params.chords.menu){
				menuModel.addMenu({
					title:  params.chords.menu.title,
					view: chordEdition.view,
					order: params.chords.menu.order
				});
			}
		}

		if (params.structure) {
			if (!params.notes) {
				throw "Edition: to add structure, cursor of notes edition needed";
			}
			//bars edition 
			var structEdition = new StructureEdition(songModel, cursorNote.controller.model, params.structure.imgPath);

			if (params.structure.menu){
				menuModel.addMenu({
					title: params.structure.menu.title,
					view: structEdition.view,
					order: params.structure.menu.order
				});
			}
		}
		

	}
	return Edition;
});