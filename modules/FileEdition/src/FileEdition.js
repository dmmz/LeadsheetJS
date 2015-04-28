define([
	"modules/FileEdition/src/FileEditionView",
	"modules/FileEdition/src/FileEditionController"
	], function(FileEditionView, FileEditionController){

	function FileEdition(songModel, canvas){
		this.view = new FileEditionView();
		new FileEditionController(songModel, canvas);
	}
	return FileEdition;
});