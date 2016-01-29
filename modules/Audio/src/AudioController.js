define(['jquery', 'pubsub'], function($, pubsub) {
	/**
	 * Low level audio treating 
	 * @param {Number} timeEndSong given in seconds 
	 */
	function AudioController(timeEndSong) {
		this.timeEndSong = timeEndSong;
		this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
		this.source = this.audioCtx.createBufferSource();
		this.isLoaded = false; //accessed publicly
		this.startedAt;
		this.pausedAt = 0;
		this.tempo;
		this.file;
		this.isPlaying = false;
		this.pos = 0;
		this.presetLoop; //will be an object
	}

	/**
	 * @param  {String} url source of audi file
	 */
	AudioController.prototype.load = function(url, tempo) {
		if (!tempo){
			throw "AudioController load missing tempo";
		}
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.responseType = 'arraybuffer';
		xhr.withCredentials = false;
		var self = this;

		xhr.onload = function() {
			var audioData = xhr.response;
			self.audioCtx.decodeAudioData(audioData, function(buffer) {
					self.buffer = buffer;
					self._setIsLoaded(tempo);
				},
				function(e) {
					throw "Error with decoding audio data" + e.err;
				});
		};
		xhr.send();
	};

	AudioController.prototype._setIsLoaded = function(tempo) {
		this.isLoaded = true;
		$.publish('PlayerModel-onload', 'audio');
		$.publish('Audio-Loaded', [this, tempo] );
	};

	AudioController.prototype.play = function(pos) {
		if (this.isPlaying) return;
		$.publish('Audio-play', this);
		if (pos) {
			this.pausedAt = pos * 1000;
		}
		this.source = this.audioCtx.createBufferSource(); // creates a sound source
		this.source.buffer = this.buffer; // tell the source which sound to play
		this.source.connect(this.audioCtx.destination); // connect the source to the context's destination (the speakers)

		if (!this.pausedAt) {
			this.startedAt = Date.now();
			this.source.start(0);
		} else {
			this.startedAt = Date.now() - this.pausedAt;
			this.source.start(0, this.pausedAt / 1000);
		}
		if (this.presetLoop) {
			this.source.loop = true;
			this.source.loopStart = this.presetLoop.from;
			this.source.loopEnd = this.presetLoop.to;
		}
		this.isPlaying = true;

		var self = this;
		//on end playing, we stoped if it is in the end of the file 
		this.source.onended = function() {
			if (self.getCurrentTime() > self.timeEndSong) {
				self.stop();
			}
		}
	};
	AudioController.prototype.getDuration = function() {
		return this.buffer.duration;
	};

	/**
	 * 
	 * @param  {Number} now       in milliseconds
	 * @param  {Number} loopStart in seconds
	 * @param  {Number} loopEnd   in seconds
	 * @return {Number}           current time in milliseconds
	 */
	AudioController.prototype._calcTime = function(now, loopStart, loopEnd) {
		loopStart *= 1000; //loop boundaries in ms
		loopEnd *= 1000;
		now = now - this.offsetLoopOn * 1000; //we saved bookmark loopOn, and we substract it 

		if (now < loopStart) {
			return now;
		} else {
			var offset = now - loopStart;
			return loopStart + (offset % (loopEnd - loopStart));
		}
	};

	/**
	 * @return {Number} Time in ms (e.g. 1532.4)
	 */
	AudioController.prototype._getCurrentPlayingTime = function() {
		var now = Date.now() - this.startedAt /* + this.pos * 1000*/ ; //in ms
		if (this.source.loop) {
			return this._calcTime(now, this.source.loopStart, this.source.loopEnd);
		} else {
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

	AudioController.prototype._stopPlaying = function() {
		this.source.stop(0);
		this.isPlaying = false;
		this.pos = 0;
		$.publish('Audio-stop', this);
	};

	AudioController.prototype.pause = function() {
		if (!this.isPlaying) return;
		this._stopPlaying();
		this.pausedAt = this._getCurrentPlayingTime();
	};
	AudioController.prototype.stop = function() {
		if (this.isPlaying) {
			this._stopPlaying();
		}
		this.pausedAt = 0;
	};

	AudioController.prototype.loop = function(from, to) {
		from = from || 0;
		to = to || this.timeEndSong;
		this.offsetLoopOn = 0;
		if (this.isPlaying) {
			this.source.loop = true;
			this.source.loopStart = from;
			this.source.loopEnd = to;
			// this.offsetLoopOn is needed to get correct current time
			var now = (Date.now() - this.startedAt) / 1000;
			if (now > to) { // if cursor was after loop, we set offsetLoopOn
				this.offsetLoopOn = now - from;
			}
		} else {
			this.presetLoop = {
				from: from,
				to: to
			}
		}
	};

	AudioController.prototype.disableLoop = function() {
		this.startedAt = Date.now() - this._getCurrentPlayingTime(); // we update startedAt like if we had made play from here	
		this.source.loop = false;
		this.presetLoop = null;
	};

	/**
	 * useful to draw wave
	 * @param  {Number} length     
	 * @param  {Number} startPoint 
	 * @param  {Number} endPoint   
	 * @return {Array}           
	 */
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