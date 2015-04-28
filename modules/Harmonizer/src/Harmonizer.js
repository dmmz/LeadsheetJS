define(['modules/Harmonizer/src/HarmonizerView',
		'modules/Harmonizer/src/HarmonizerController'
	], function(HarmonizerView, HarmonizerController) {
	
	function Harmonizer(songModel) {

		var hV = new HarmonizerView();
		var hC = new HarmonizerController(songModel, hV);
		
		this.view = hV;
	}
	return Harmonizer;
});