define([
	'pubsub'
], function(pubsub) {

	function WaveManagerController(waveMng) {
		if (!waveMng) throw "WaveManagerController - WaveMng not defined";

		$.subscribe("WaveManagerView-play", function() {
			waveMng.play();
		});
		$.subscribe("WaveManagerView-pause", function() {
			waveMng.pause();
		});
		//when 
		$.subscribe("ToViewer-draw", function(el, songModel) {
			if (waveMng.isReady()) {
				waveMng.drawer.drawAudio(waveMng);
			}
		});
	}
	return WaveManagerController;
});