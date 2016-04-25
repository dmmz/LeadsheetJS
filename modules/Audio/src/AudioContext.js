define(function() {
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	if (!AudioContext) {
		// create empty Object if no audio api available (IE, phantomJS)
		return function AudioContext() {
			this.createBufferSource = function(){};
		};
	} else {
		return AudioContext;
	}
});