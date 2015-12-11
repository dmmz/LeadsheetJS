define([
	"modules/StructureEdition/src/StructureEditionController",
	"modules/StructureEdition/src/StructureEditionModel",
	"modules/StructureEdition/src/StructureEditionView",
], function(StructureEditionController, StructureEditionModel, StructureEditionView) {
	/**
	 * StructureEdition constructor
	 * @exports StructureEdition
	 */
	function StructureEdition(songModel, cursorModel, imgPath) {
		this.view = new StructureEditionView(imgPath);
		var seM = new StructureEditionModel();
		var seC = new StructureEditionController(songModel, cursorModel, seM);
	}
	return StructureEdition;
});