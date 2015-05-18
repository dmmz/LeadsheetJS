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

		var sampleStart = ~~(startPoint * this.buffer.length);
		var sampleEnd = ~~(endPoint * this.buffer.length);
		var sampleSize = (sampleEnd - sampleStart) / length;
		// var sampleSize = this.buffer.length / length;
		var sampleStep = ~~(sampleSize / 10) || 1;
		var channels = this.buffer.numberOfChannels;
		var splitPeaks = [];
		var mergedPeaks = [];

		for (var c = 0; c < channels; c++) {
			var peaks = splitPeaks[c] = [];
			var chan = this.buffer.getChannelData(c);

			for (var i = 0; i < length; i++) {
				var start = ~~((i * sampleSize) + sampleStart);
				var end = ~~(start + sampleSize);
				var max = 0;
				for (var j = start; j < end; j += sampleStep) {
					var value = chan[j];
					if (value > max) {
						max = value;
						// faster than Math.abs
					} else if (-value > max) {
						max = -value;
					}
				}
				peaks[i] = max;

				if (c == 0 || max > mergedPeaks[i]) {
					mergedPeaks[i] = max;
				}
			}
		}
		return mergedPeaks;

	};
	return WaveAudio;
});