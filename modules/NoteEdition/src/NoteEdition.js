define([
	"modules/NoteEdition/src/NoteEditionController",
	"modules/NoteEdition/src/NoteEditionView",
	"modules/NoteEdition/src/NoteSpaceManager"
], function(NoteEditionController, NoteEditionView, NoteSpaceManager) {
	/**
	 * NoteEdition constructor
	 * @exports NoteEdition
	 */
	function NoteEdition(songModel, cursorModel, viewer, imgPath) {
		this.noteSpaceMng = new NoteSpaceManager(cursorModel, viewer);
		new NoteEditionController(songModel, cursorModel, this.noteSpaceMng);
		this.view = new NoteEditionView(imgPath);
	}
	return NoteEdition;
});