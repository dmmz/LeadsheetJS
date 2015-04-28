define([
		"modules/Cursor/src/CursorController",
		"modules/Cursor/src/CursorModel",
		"modules/Cursor/src/CursorView"
		], function(CursorController, CursorModel, CursorView){

		function Cursor (listElement, songModel, id, keyType) {
			var cM = new CursorModel(listElement);
			var cV = new CursorView(cM, id, keyType);
			this.controller = new CursorController(songModel, cM, cV);
		}
		return Cursor;
});