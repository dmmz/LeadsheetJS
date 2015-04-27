define([
		"modules/StructureEdition/src/StructureEditionController",
		"modules/StructureEdition/src/StructureEditionModel",
		"modules/StructureEdition/src/StructureEditionView",
	],
	function(StructureEditionController, StructureEditionModel, StructureEditionView) {
		return {
			"StructureEditionController": StructureEditionController,
			"StructureEditionModel": StructureEditionModel,
			"StructureEditionView": StructureEditionView
		};
	}
);