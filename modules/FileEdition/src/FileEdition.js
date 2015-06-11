define([
	"modules/FileEdition/src/FileEditionView",
	"modules/FileEdition/src/FileEditionController"
	], function(FileEditionView, FileEditionController){

	function FileEdition(songModel, canvas, saveFunction, waveManager, params){
		this.view = new FileEditionView(params);
		new FileEditionController(songModel, canvas, saveFunction, waveManager );
	}
	return FileEdition;
});