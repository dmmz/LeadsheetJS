define([
		"modules/Cursor/src/CursorController",
		"modules/Cursor/src/CursorModel",
		"modules/Cursor/src/CursorView",
	],
	function(CursorController, CursorModel, CursorView) {
		return {
			"CursorController": CursorController,
			"CursorModel": CursorModel,
			"CursorView": CursorView
		};
	}
);