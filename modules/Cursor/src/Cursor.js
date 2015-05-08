define([
		"modules/Cursor/src/CursorController",
		"modules/Cursor/src/CursorModel",
		"modules/Cursor/src/CursorListener"
		], function(CursorController, CursorModel, CursorListener){

		function Cursor (listElement, songModel, id, keyType) {
			var cM = new CursorModel(listElement);
			var cV = new CursorListener(keyType);
			this.controller = new CursorController(songModel, cM, cV);
		}
		return Cursor;
});