define([
	'jquery',
	'pubsub',
], function($, pubsub) {
	function WaveModel(option) {
		/* option contain
			volume				// Float Main volume for all instruments it vary between 0 and 1
		*/
		this.audio = new Audio();
		document.body.appendChild(this.audio);
		this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
		this.source = this.audioCtx.createBufferSource();
		this.tempo = null;
		this.isPlayingEnabled = false; //this is initialized on load
		this.isDrawingEnabled = false;
		this.initModelEvents();

		var initVolume;
		if ((typeof option !== "undefined" && typeof(option.volume) !== "undefined")) {
			// case that developper explicitly declared volume
			initVolume = option.volume;
		} else {
			// natural case (it use storage item to get last user volume)
			initVolume = this.initVolume(0.7);
		}
		this.setVolume(initVolume);
	}

	WaveModel.prototype.play = function(playFrom, playTo) {
		if (this.isPlayingEnabled === false) {
			return;
		}
		if (typeof playFrom !== "undefined") {
			this.audio.currentTime = playFrom;
		}
		if (typeof playTo !== "undefined") {
			this.playTo = playTo;
			this.playFrom = playFrom;
		} else {
			this.playTo = undefined;
		}
		this.audio.play();
		$.publish('PlayerModel-onplay');
	};

	WaveModel.prototype.pause = function() {
		if (this.isPlayingEnabled === false) {
			return;
		}
		this.audio.pause();
		$.publish('PlayerModel-onpause');
	};

	WaveModel.prototype.stop = function() {
		if (this.isPlayingEnabled === false || this.audio.readyState === 0) {
			return;
		}
		this.audio.pause();
		this.audio.currentTime = 0.0;
		$.publish('PlayerModel-onstop');
	};

	WaveModel.prototype.initVolume = function(volume, force) {
		var oldVolume = localStorage.getItem("player-volume");
		if (oldVolume === null) {
			return volume;
		}
		return oldVolume;
	};

	WaveModel.prototype.setVolume = function(volume) {
		if (this.isPlayingEnabled === false) {
			return;
		}
		if (typeof volume === "undefined" || isNaN(volume)) {
			throw 'WaveModel - setVolume - volume must be a number ' + volume;
		}
		this.audio.volume = volume;
		localStorage.setItem("player-volume", volume);
		$.publish('PlayerModel-onvolumechange', volume);
	};

	WaveModel.prototype.mute = function() {
		if (this.isPlayingEnabled === false) {
			return;
		}
		this.tmpVolume = this.audio.volume;
		this.setVolume(0);
	};

	WaveModel.prototype.unmute = function() {
		if (this.isPlayingEnabled === false) {
			return;
		}
		this.setVolume(this.tmpVolume);
	};

	WaveModel.prototype.setLoop = function(loop) {
		if (this.isPlayingEnabled === false) {
			return;
		}
		if (typeof loop !== "undefined") {
			this.audio.loop = !!loop;
			$.publish('PlayerModel-toggleLoop', this.audio.loop);
			return true;
		} else {
			return false;
		}
	};

	WaveModel.prototype.toggleLoop = function() {
		if (this.isPlayingEnabled === false) {
			return;
		}
		if (this.audio.loop === true) {
			this.setLoop(false);
		} else {
			this.setLoop(true);
		}
		return this.audio.loop;
	};

	/**
	 * On this function we load both audioCtx and HTML audio tag.
	 * @param  {[type]}   url       [description]
	 * @param  {[type]}   audioData [description]
	 * @param  {float}   tempo     
	 * @param  {Function} callback
	 */
	WaveModel.prototype.load = function(url, audioData, tempo, callback) {
		var self = this;
		var HTMLTagIsLoaded = false;
		var audioCtxIsLoaded = false;
		// Check if HTML audio tag is fully loaded
		$(this.audio).on('durationchange', function() {
			HTMLTagIsLoaded = true;
			checkLoad();
		});
		this.audio.src = url;
		this.audioCtx.decodeAudioData(audioData, function(buffer) {
				self.buffer = []; // remove previous buffer (usefull for memory)
				self.buffer = buffer;
				self.tempo = tempo;
				self.beatDuration = 60 / tempo;
				self.source = self.audioCtx.createBufferSource();
				self.source.buffer = self.buffer;
				//source.playbackRate.value = playbackControl.value;
				self.source.connect(self.audioCtx.destination);
				audioCtxIsLoaded = true;
				checkLoad();
				self.enable();
				//source.start(0)
			},
			function(e) {
				throw "Error with decoding audio data" + e.err;
			}
		);

		function checkLoad() {
			if (HTMLTagIsLoaded && audioCtxIsLoaded) {
				$.publish('PlayerModel-onload','audio');
				if (typeof callback !== "undefined") {
					callback();
				}
			}
		}
	};

	WaveModel.prototype.initModelEvents = function() {
		var self = this;
		$(this.audio).on('ended', function() {
			if (self.isPlayingEnabled === false) {
				return;
			}
			$.publish('PlayerModel-onfinish');
		});
		$(this.audio).on('playing', function() {
			if (self.isPlayingEnabled === false) {
				return;
			}
			$.publish('PlayerModel-playing');
		});
		$(this.audio).on('timeupdate', function() {
			if (self.isPlayingEnabled === false) {
				return;
			}
			if (typeof self.playTo !== "undefined") {
				if (self.audio.currentTime > self.playTo) {
					if (self.audio.loop === true) {
						self.play(self.playFrom, self.playTo);
					}
					/* User probably want the player to continue in this case, it's why it's commented
					else { 
						self.stop();
					}
					*/
				}
			}
			var songDuration = self.getDuration();
			var positionInPercent = self.audio.currentTime / songDuration;
			$.publish('PlayerModel-onPosition', {
				'positionInPercent': positionInPercent,
				'songDuration': songDuration * 1000
			});
		});
	};


	WaveModel.prototype.getDuration = function() {
		return this.audio.duration;
	};

	WaveModel.prototype.enable = function() {
		this.isPlayingEnabled = true;
		this.isDrawingEnabled = true;
	};
	WaveModel.prototype.disable = function() {
		this.stop();
		this.isPlayingEnabled = false;
		this.isDrawingEnabled = false;
	};
	WaveModel.prototype.enablePlaying = function() {
		this.isPlayingEnabled = true;
	};
	WaveModel.prototype.disablePlaying = function() {
		this.isPlayingEnabled = false;
	};
	WaveModel.prototype.enableDrawing = function() {
		this.isDrawingEnabled = true;
	};
	WaveModel.prototype.disableDrawing = function() {
		this.isDrawingEnabled = false;
	};

	WaveModel.prototype.getPeaks = function(length, startPoint, endPoint) {
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
			//console.log(absMax);
		}
		return mergedPeaks;
	};

	return WaveModel;
});