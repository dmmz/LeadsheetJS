define([
		"modules/NoteEdition/src/NoteEditionController",
		"modules/NoteEdition/src/NoteEditionView",
		"modules/NoteEdition/src/NoteSpaceManager"
	],function(NoteEditionController, NoteEditionView, NoteSpaceManager){
	
	function NoteEdition (songModel,cursorModel,imgPath) {
		new NoteSpaceManager(songModel, cursorModel);
		new NoteEditionController(songModel, cursorModel);
		this.view = new NoteEditionView(imgPath);
	}
	return NoteEdition;
});