define([
	"modules/ChordEdition/src/ChordEditionController",
	"modules/ChordEdition/src/ChordEditionView",
	"modules/ChordEdition/src/ChordSpaceManager",
	"modules/ChordEdition/src/ChordSpaceEdition"
], function(ChordEditionController, ChordEditionView, ChordSpaceManager, ChordSpaceEdition) {
	/**
	 * ChordEdition constructor
	 * @exports ChordEdition
	 */
	function ChordEdition(songModel, cursorModel, viewer, imgPath) {
		var chordSpaceEdition =new ChordSpaceEdition(songModel, viewer);
		this.chordSpaceMng = new ChordSpaceManager(songModel, cursorModel, viewer, false, chordSpaceEdition);

		this.view = new ChordEditionView(cursorModel, imgPath);
		this.controller = new ChordEditionController(songModel, cursorModel, this.chordSpaceMng);
	}
	return ChordEdition;
});