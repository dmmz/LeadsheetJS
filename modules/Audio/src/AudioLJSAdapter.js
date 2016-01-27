define(function(){
	function AudioLJSAdapter(song, audio, tempo){
		this.songNumBeats =  song.getComponent('notes').getTotalDuration();
		this.beatDuration = 60 / tempo;
		this.songDuration = this.beatDuration * this.songNumBeats; //song duration until last beat (without residual audio)
		this.audioDuration = audio.getDuration();
	};
	AudioLJSAdapter.prototype.getDuration = function() {
		return this.audioDuration;
	};
	return AudioLJSAdapter;
});
