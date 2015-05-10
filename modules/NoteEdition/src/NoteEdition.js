define([
		"modules/NoteEdition/src/NoteEditionController",
		"modules/NoteEdition/src/NoteEditionView",
		"modules/NoteEdition/src/NoteSpaceManager"
	],function(NoteEditionController, NoteEditionView, NoteSpaceManager){
	
	function NoteEdition (songModel, cursorModel, viewer, imgPath) {
		var noteSpaceMng = new NoteSpaceManager(songModel, cursorModel, viewer);
		new NoteEditionController(songModel, cursorModel, noteSpaceMng);
		this.view = new NoteEditionView(imgPath);
	}
	return NoteEdition;
});