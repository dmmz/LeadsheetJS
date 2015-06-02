define([
	'jquery',
	'pubsub'
], function($, pubsub) {

	function WaveManagerController(waveMng) {
		if (!waveMng) throw "WaveManagerController - WaveMng not defined";

		$.subscribe("ToPlayer-play", function() {
			waveMng.play();
		});
		$.subscribe("ToPlayer-pause", function() {
			waveMng.pause();
		});
		$.subscribe('ToPlayer-stop', function() {
			waveMng.pause();
		});
		//when 
		$.subscribe("ToViewer-draw", function(el, songModel) {
			if (waveMng.isReady()) {
				waveMng.drawer.drawAudio(waveMng.barTimesMng,waveMng.audio.tempo,waveMng.audio.getDuration());
			}
		});
		$.subscribe("ToLayers-removeLayer", function() {
			// TODO Add an unload waveAudio when it will be available
		});
	}
	return WaveManagerController;
});