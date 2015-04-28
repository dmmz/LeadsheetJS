define([
		"modules/ChordEdition/src/ChordEditionController",
		"modules/ChordEdition/src/ChordEditionView",
		"modules/ChordEdition/src/ChordSpaceManager"
	],function(ChordEditionController, ChordEditionView, ChordSpaceManager){
	
	function ChordEdition (songModel, cursorModel, imgPath) {
		new ChordSpaceManager(songModel, cursorModel);
		this.view = new ChordEditionView(undefined, cursorModel, imgPath);
		new ChordEditionController(songModel, cursorModel, this.view);

	}
	return ChordEdition;
});