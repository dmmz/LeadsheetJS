define(function() {
	function WaveAudio() {
		this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
		this.source = this.audioCtx.createBufferSource();
		this.tempo = null;
	}

	WaveAudio.prototype._createSource = function() {

		this._disconnectSource();
		this.source = this.audioCtx.createBufferSource();
		this.source.buffer = this.buffer;
		this.source.connect(this.audioCtx.destination);

	};
	WaveAudio.prototype._disconnectSource = function() {
		if (this.source) {
			this.source.disconnect();
		}
	};

	WaveAudio.prototype.play = function() {
		this._createSource();
		this.source.start(0);
	};

	WaveAudio.prototype.pause = function() {
		this._disconnectSource();
		this.source.stop(0);
	};

	WaveAudio.prototype.load = function(audioData, waveMng, tempo, callback) {
		var self = this;
		this.audioCtx.decodeAudioData(audioData, function(buffer) {
				
				self.buffer = buffer;
				self.tempo  = tempo;
				self.beatDuration = 60 / tempo;
				self.source.buffer = self.buffer;
				//source.playbackRate.value = playbackControl.value;
				self.source.connect(self.audioCtx.destination);
				
				if (typeof callback !== "undefined") {
					callback();
				}
				//source.start(0)
			},
			function(e) {
				throw "Error with decoding audio data" + e.err;
			}
		);
	};
	WaveAudio.prototype.getDuration = function() {
		return this.buffer.duration;
	};
	WaveAudio.prototype.getPeaks = function(length, startPoint, endPoint) {

		startPoint = startPoint || 0;
		endPoint = endPoint || 1;

		var sampleStart = ~~(startPoint * this.buffer.length),
		sampleEnd = ~~(endPoint * this.buffer.length),
		sampleSize = (sampleEnd - sampleStart) / length,
		sampleStep = ~~(sampleSize / 10) || 1,
		channels = this.buffer.numberOfChannels,
		//splitPeaks = [],
		mergedPeaks = [],
		/*peaks,*/ chan, start, end, max, c, i, j, value, absMax = 0;
		
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
			//console.log(absMax);
		}
		return mergedPeaks;

	};
	return WaveAudio;
});