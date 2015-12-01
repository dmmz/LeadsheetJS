define([
	"modules/FileEdition/src/FileEditionView",
	"modules/FileEdition/src/FileEditionController"
	], function(FileEditionView, FileEditionController){

	function FileEdition(songModel, viewer, saveFunction, params){
		this.view = new FileEditionView(params);
		new FileEditionController(songModel, viewer, saveFunction);
	}
	return FileEdition;
});