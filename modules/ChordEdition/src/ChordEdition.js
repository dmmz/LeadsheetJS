define([
	"modules/ChordEdition/src/ChordEditionController",
	"modules/ChordEdition/src/ChordEditionView",
	"modules/ChordEdition/src/ChordSpaceManager"
], function(ChordEditionController, ChordEditionView, ChordSpaceManager) {

	function ChordEdition(songModel, cursorModel, viewer, imgPath) {
		this.chordSpaceMng = new ChordSpaceManager(songModel, cursorModel, viewer);
		this.view = new ChordEditionView(cursorModel, imgPath);

		new ChordEditionController(songModel, cursorModel, this.chordSpaceMng);

	}
	return ChordEdition;
});