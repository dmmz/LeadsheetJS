define([
		"modules/NoteEdition/src/NoteEditionController",
		"modules/NoteEdition/src/NoteEditionView",
		"modules/NoteEdition/src/NoteSpaceManager",
		"modules/NoteEdition/src/NoteSpaceView",
	],
	function(NoteEditionController, NoteEditionView, NoteSpaceManager, NoteSpaceView) {
		return {
			"NoteEditionController": NoteEditionController,
			"NoteEditionView": NoteEditionView,
			"NoteSpaceManager": NoteSpaceManager,
			"NoteSpaceView": NoteSpaceView
		};
	}
);