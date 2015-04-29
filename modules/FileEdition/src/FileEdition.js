define([
	"modules/FileEdition/src/FileEditionView",
	"modules/FileEdition/src/FileEditionController"
	], function(FileEditionView, FileEditionController){

	function FileEdition(songModel, canvas, waveManager){
		this.view = new FileEditionView();
		new FileEditionController(songModel, canvas, waveManager);
	}
	return FileEdition;
});