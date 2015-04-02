define([
	'pubsub'
], function(pubsub) {

	function WaveManagerController(waveMng) {
		if (!waveMng) throw "WaveManagerController - WaveMng not defined";
		
		$.subscribe("WaveManagerView-play",function(){
			waveMng.play();
		});
		$.subscribe("WaveManagerView-pause",function(){
			waveMng.pause();

		});
	}
	return WaveManagerController;
});