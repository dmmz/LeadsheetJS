define([
	"modules/FileEdition/src/FileEditionView",
	"modules/FileEdition/src/FileEditionController"
], function(FileEditionView, FileEditionController) {
	/**
	 * FileEdition constructor
	 * @exports FileEdition
	 */
	function FileEdition(songModel, viewer, saveFunction, params, saveAsF) {
		this.view = new FileEditionView(params);
		new FileEditionController(songModel, viewer, saveFunction, true); //saveAs is true
	}
	return FileEdition;
});