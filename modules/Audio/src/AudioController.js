define(['jquery', 'pubsub'], function($, pubsub) {
	function AudioController(timeEndSong) {
		this.timeEndSong = timeEndSong;
		this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
		this.source = this.audioCtx.createBufferSource();
		this.isLoaded = false;
		this.startedAt;
		this.pausedAt = 0;
		this.tempo;
		this.file;
		this.isPlaying = false
		this.presetLoop; //will be an object
	}

	AudioController.prototype.load = function(url) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.responseType = 'arraybuffer';
		xhr.withCredentials = false;
		var self = this;

		xhr.onload = function() {
			var audioData = xhr.response;
			self.audioCtx.decodeAudioData(audioData, function(buffer) {
					self.buffer = buffer;
					self._setIsLoaded();
				},
				function(e) {
					throw "Error with decoding audio data" + e.err;
				});
		};
		xhr.send();
	};

	AudioController.prototype._setIsLoaded = function() {
		this.isLoaded = true;
		$.publish('PlayerModel-onload', 'audio');
		$.publish('Audio-Loaded', this);
	};

	AudioController.prototype.play = function() {
		if (this.isPlaying) return;

		this.source = this.audioCtx.createBufferSource(); // creates a sound source
		this.source.buffer = this.buffer; // tell the source which sound to play
		this.source.connect(this.audioCtx.destination); // connect the source to the context's destination (the speakers)
		
		if (!this.pausedAt){
			this.startedAt = Date.now();
			this.source.start();
		}else{
			this.startedAt = Date.now() - this.pausedAt;
			this.source.start(0, this.pausedAt / 1000);
		}
		if (this.presetLoop){
			this.source.loop = true;
			this.source.loopStart = this.presetLoop.from;
			this.source.loopEnd = this.presetLoop.to;
		}
		this.isPlaying = true;

		var self = this;
		this.source.onended = function(){
		 	if (self.getCurrentTime() > self.source.buffer.duration){
		 		self.stop();
		 	}
		}
	};
	AudioController.prototype.getDuration = function() {
		return this.buffer.duration;
	};

	AudioController.prototype._calcTime = function(now, loopStart, loopEnd) {
		loopStart *= 1000; //loop boundaries in ms
		loopEnd *= 1000;
		if (now < loopStart){
			return now;
		}else{
			var offset = now - loopStart;
			return loopStart + (offset % (loopEnd - loopStart));
		}
	};

	/**
	 
	 * @return {Number} Time in ms (e.g. 1532.4)
	 */
	AudioController.prototype._getCurrentPlayingTime = function() {
		var now = Date.now() - this.startedAt; //in ms
		if (this.source.loop){
			return this._calcTime(now, this.source.loopStart, this.source.loopEnd);
		}else{
			return now;
		}
	};

	/**
	 * @return {Number} time in seconds (e.g. 1.5324)
	 */
	AudioController.prototype.getCurrentTime = function() {
		var now = this.isPlaying ? this._getCurrentPlayingTime() : this.pausedAt;
		return now / 1000;
	};


	AudioController.prototype.pause = function() {
		if (!this.isPlaying) return;
		this.source.stop(0)
		this.isPlaying = false;

		this.pausedAt = this._getCurrentPlayingTime();
	};
	AudioController.prototype.stop = function() {
		if (this.isPlaying){
			this.source.stop(0)
			this.isPlaying = false;
		}
		this.pausedAt = 0;
	};

	AudioController.prototype.loop = function(from, to) {
		from = from || 0;
		to = to || this.timeEndSong;

		if (this.isPlaying){
			this.source.loop = true;
			this.source.loopStart = from;
			this.source.loopEnd = to;
		}else{
			this.presetLoop = {
				from: from,
				to: to
			}
		}
	};

	AudioController.prototype.disableLoop = function() {
		this.source.loop = false;
		this.presetLoop = null;
	};
	AudioController.prototype.getPeaks = function(length, startPoint, endPoint) {
		startPoint = startPoint || 0;
		endPoint = endPoint || 1;

		var sampleStart = ~~(startPoint * this.buffer.length),
			sampleEnd = ~~(endPoint * this.buffer.length),
			sampleSize = (sampleEnd - sampleStart) / length,
			sampleStep = ~~(sampleSize / 10) || 1,
			channels = this.buffer.numberOfChannels,
			//splitPeaks = [],
			mergedPeaks = [],
			/*peaks,*/
			chan, start, end, max, c, i, j, value, absMax = 0;

		for (c = 0; c < channels; c++) {
			//peaks = splitPeaks[c] = [];
			chan = this.buffer.getChannelData(c);

			for (i = 0; i < length; i++) {
				start = ~~((i * sampleSize) + sampleStart);
				end = ~~(start + sampleSize);
				max = 0;
				for (j = start; j < end; j += sampleStep) {
					value = chan[j];
					if (value > max) {
						max = value;
						// faster than Math.abs
					} else if (-value > max) {
						max = -value;
					}
				}
				//peaks[i] = max;

				if (c === 0 || max > mergedPeaks[i]) {
					mergedPeaks[i] = max;
					if (max > absMax) absMax = max;
				}
			}
		}
		return mergedPeaks;
	};
	return AudioController;
});