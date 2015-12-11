define([
	"modules/Cursor/src/CursorController",
	"modules/Cursor/src/CursorModel",
	"modules/Cursor/src/CursorListener"
], function(CursorController, CursorModel, CursorListener) {
	/**
	 * Cursor constructor
	 * @exports Cursor
	 */
	function Cursor(listElement, id, keyType) {
		this.model = new CursorModel(listElement, id);
		var cV = new CursorListener(id, keyType);
		this.controller = new CursorController(this.model, cV);
	}
	return Cursor;
});