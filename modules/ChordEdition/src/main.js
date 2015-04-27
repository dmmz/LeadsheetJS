define([
		"modules/ChordEdition/src/ChordEditionController",
		"modules/ChordEdition/src/ChordEditionView",
		"modules/ChordEdition/src/ChordSpaceManager",
		"modules/ChordEdition/src/ChordSpaceView",
	],
	function(ChordEditionController, ChordEditionView, ChordSpaceManager, ChordSpaceView) {
		return {
			"ChordEditionController": ChordEditionController,
			"ChordEditionView": ChordEditionView,
			"ChordSpaceManager": ChordSpaceManager,
			"ChordSpaceView": ChordSpaceView
		};
	}
);