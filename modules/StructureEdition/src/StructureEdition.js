define([
	"modules/StructureEdition/src/StructureEditionController",
	"modules/StructureEdition/src/StructureEditionModel",
	"modules/StructureEdition/src/StructureEditionView",
	], function(StructureEditionController, StructureEditionModel, StructureEditionView){
	
	function StructureEdition(songModel, cursorModel, imgPath ){
		this.view = new StructureEditionView(imgPath);
		var seM = new StructureEditionModel();
		var seC = new StructureEditionController(songModel, cursorModel, seM, this.view);
	}
	return StructureEdition;
});