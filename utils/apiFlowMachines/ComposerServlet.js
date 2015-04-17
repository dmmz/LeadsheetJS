define(['jquery'], function($) {
	var ComposerServlet = {};

	/**
	 * Return correct request for simple audio get
	 */
	ComposerServlet.getRequestForSimpleAudio = function(leadsheet, tempo, playComping, playTick, style) {
		var request = {
			'ls.leadsheet': leadsheet,
			'type': 'audio',
			'ex.tempo': tempo,
			'seq.tick.play': playTick,
			'seq.comping.play': playComping,
			'seq.bass.play': playComping,
			'ex.audio.sampleRate': 48000,
			'ex.audio.bitrate': 320,
		};
		return request;
	};
	/**
	 * Return correct request for simple midi get
	 */
	ComposerServlet.getRequestForSimpleMidi = function(leadsheet, tempo, playComping, playTick) {
		var request = {
			'ls.leadsheet': leadsheet,
			'type': 'midi',
			'ex.tempo': tempo,
			'seq.tick.play': playTick,
			'seq.comping.play': playComping,
			'seq.bass.play': playComping,
		};
		return request;
	};

	return ComposerServlet;
});