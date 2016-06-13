define([
	"jquery",
	"modules/StructureEdition/src/StructureEditionController",
	"modules/StructureEdition/src/StructureEditionModel",
	"modules/StructureEdition/src/StructureEditionView",
	"modules/Edition/src/EditionModuleInterface"
], function($, StructureEditionController, StructureEditionModel, StructureEditionView, EditionModuleInterface) {
	/**
	 * StructureEdition constructor
	 * @exports StructureEdition
	 */
	function StructureEdition(songModel, cursorModel, imgPath) {
		$.extend(this, new EditionModuleInterface());
		this.view = new StructureEditionView(imgPath);
		this.model = new StructureEditionModel();
		this.controller = new StructureEditionController(songModel, cursorModel, this.model);
	}
	return StructureEdition;
});