define([
	"modules/FileEdition/src/FileEditionView",
	"modules/FileEdition/src/FileEditionController"
], function(FileEditionView, FileEditionController) {
	/**
	 * FileEdition constructor
	 * @exports FileEdition
	 */
	function FileEdition(songModel, viewer, viewParams) {
		this.view = new FileEditionView(viewParams);
		new FileEditionController(songModel, viewer); //saveAs is true
	}
	return FileEdition;
});