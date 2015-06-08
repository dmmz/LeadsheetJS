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
		$.subscribe("ToLayers-removeLayer", function() {
			waveMng.disable();
		});
	}
	return WaveManagerController;
});