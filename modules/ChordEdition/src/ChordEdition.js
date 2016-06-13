define([
	"jquery",
	"modules/ChordEdition/src/ChordEditionController",
	"modules/ChordEdition/src/ChordEditionView",
	"modules/ChordEdition/src/ChordSpaceManager",
	"modules/ChordEdition/src/ChordSpaceEdition",
	"modules/Edition/src/EditionModuleInterface",
	"modules/Edition/src/EditionControllerInterface"
], function($, ChordEditionController, ChordEditionView, ChordSpaceManager, ChordSpaceEdition, EditionModuleInterface, EditionControllerInterface) {
	/**
	 * ChordEdition constructor
	 * @exports ChordEdition
	 */
	function ChordEdition(songModel, cursorModel, viewer, imgPath) {
		var _parent = new EditionModuleInterface();
		$.extend(this, _parent);
		var chordSpaceEdition =new ChordSpaceEdition(songModel, viewer);
		this.chordSpaceMng = new ChordSpaceManager(songModel, cursorModel, viewer, false, chordSpaceEdition);
		$.extend(this.chordSpaceMng, new EditionControllerInterface());
		this.view = new ChordEditionView(cursorModel, imgPath);
		this.controller = new ChordEditionController(songModel, cursorModel, this.chordSpaceMng);
		// overload EditionModuleInterface to disable chordSpaceManager as well as controller
		this.setEditable = function(editable) {
			_parent.setEditable.apply(this, [editable]);
			this.chordSpaceMng.setEditable(editable);
		};
	}
	return ChordEdition;
});