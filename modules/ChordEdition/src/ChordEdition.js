define([
	"modules/ChordEdition/src/ChordEditionController",
	"modules/ChordEdition/src/ChordEditionView",
	"modules/ChordEdition/src/ChordSpaceManager"
], function(ChordEditionController, ChordEditionView, ChordSpaceManager) {
	/**
	 * ChordEdition constructor
	 * @exports ChordEdition
	 */
	function ChordEdition(songModel, cursorModel, viewer, imgPath) {
		this.chordSpaceMng = new ChordSpaceManager(songModel, cursorModel, viewer);
		this.view = new ChordEditionView(cursorModel, imgPath);
		this.controller = new ChordEditionController(songModel, cursorModel, this.chordSpaceMng);
	}
	return ChordEdition;
});