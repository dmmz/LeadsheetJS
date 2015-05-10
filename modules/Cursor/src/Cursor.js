define([
		"modules/Cursor/src/CursorController",
		"modules/Cursor/src/CursorModel",
		"modules/Cursor/src/CursorListener"
		], function(CursorController, CursorModel, CursorListener){

		function Cursor (listElement, id, keyType) {
			var cM = new CursorModel(listElement);
			var cV = new CursorListener(keyType);
			this.controller = new CursorController(cM, cV);
		}
		return Cursor;
});