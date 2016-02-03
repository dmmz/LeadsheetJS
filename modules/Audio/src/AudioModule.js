define([
	'modules/Audio/src/AudioController',
    'modules/Audio/src/AudioDrawer',
    'modules/Audio/src/AudioCursor',
    'modules/Audio/src/AudioPlayer'
],function(AudioController, AudioDrawer, AudioCursor, AudioPlayer){
	function AudioModule(song, params){
		params = params || {};
		var audio = new AudioController(song);
		new AudioPlayer(audio);

		if (params.draw){
			var paramsDrawer = {
	          showHalfWave: true,
	          //drawMargins: true,
	          topAudio: -120,
	          heightAudio: 75,
    	    };
    	    
	    	var audioDrawer = new AudioDrawer(song, params.draw.viewer, params.draw.notesCursor, paramsDrawer);
		}

		return audio;
	}
	return AudioModule;
});