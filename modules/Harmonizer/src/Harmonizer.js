define(['modules/Harmonizer/src/HarmonizerView',
		'modules/Harmonizer/src/HarmonizerController'
	], function(HarmonizerView, HarmonizerController) {
	
	function Harmonizer(songModel, menuModel, waveManager) {
		var hV = new HarmonizerView();
		var hC = new HarmonizerController(songModel, hV, waveManager);
		
		this.view = hV;
	}
	return Harmonizer;
});