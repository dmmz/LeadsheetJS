define([
		"modules/LSViewer/src/BarWidthManager",
		"modules/LSViewer/src/BeamManager",
		"modules/LSViewer/src/LSBarView",
		"modules/LSViewer/src/LSChordView",
		"modules/LSViewer/src/LSNoteView",
		"modules/LSViewer/src/LSViewer",
		"modules/LSViewer/src/TieManager",
		"modules/LSViewer/src/TupletManager",
	],
	function(BarWidthManager, BeamManager, LSBarView, LSChordView, LSNoteView, LSViewer, TieManager, TupletManager) {
		return {
			"BarWidthManager": BarWidthManager,
			"BeamManager": BeamManager,
			"LSBarView": LSBarView,
			"LSChordView": LSChordView,
			"LSNoteView": LSNoteView,
			"LSViewer": LSViewer,
			"TieManager": TieManager,
			"TupletManager": TupletManager
		};
	}
);