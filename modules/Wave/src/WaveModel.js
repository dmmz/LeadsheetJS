define([
	'jquery',
	'pubsub',
], function($, pubsub) {
	function WaveModel(songNumBeats, volume) {
		this.audio = new Audio();
		document.body.appendChild(this.audio);
		this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
		this.source = this.audioCtx.createBufferSource();
		this.tempo = null;
		this.isPlayingEnabled = false; //this is initialized on load
		this.isDrawingEnabled = false;
		this.initModelEvents();
		this.songNumBeats = songNumBeats;
		var initVolume;
		if (volume !== undefined) {
			// case that developper explicitly declared volume
			initVolume = volume;
		} else {
			// natural case (it use storage item to get last user volume)
			initVolume = this.initVolume(0.7);
		}
		this.setVolume(initVolume);
		
	}

	/**
	 * As they are time positions, we use this function to let an offset in between
	 * @param  {Number} pos1 
	 * @param  {Number} pos2 
	 * @return {Boolean}      
	 */		
	WaveModel.prototype._positionsEqual = function(pos1,pos2) {
		return Math.abs(pos1 - pos2) < 0.1;
	};

	WaveModel.prototype.setPlayFromTo = function(playFrom, playTo) {
		this.playFrom = playFrom;
		this.playTo = playTo;
	};

	WaveModel.prototype.play = function() {
		this.audio.currentTime = this.playFrom || 0; // if pause, this.playFrom has some value, if stop we set it to 0
		
		//the code to loop through the whole song
		if (this.audio.loop && this._positionsEqual(this.playFrom,this.playTo)){
				this.playTo = this.songDuration;
				this.playFrom = 0;
		}
		this.audio.play();
		$.publish('PlayerModel-onplay');
	};

	WaveModel.prototype.pause = function() {
		if (this.isPlayingEnabled === false) {
			return;
		}
		this.playFrom = this.audio.currentTime;

		this.audio.pause();
		$.publish('PlayerModel-onpause');
	};

	WaveModel.prototype.stop = function() {
		if (this.isPlayingEnabled === false || this.audio.readyState === 0) {
			return;
		}
		this.audio.pause();
		this.playFrom = 0;
		this.playTo = 0;
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
		this.audio.loop = !!loop;
		$.publish('PlayerModel-toggleLoop', this.audio.loop);
		
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
				self.songDuration = self.beatDuration * self.songNumBeats; //song duration until last beat (without residual audio)
				self.source = self.audioCtx.createBufferSource();
				self.source.buffer = self.buffer;
				//source.playbackRate.value = playbackControl.value;
				self.source.connect(self.audioCtx.destination);
				audioCtxIsLoaded = true;
				checkLoad();
				self.enable();
				//source.start(0)
				self.setPlayFromTo(0,null); // self.getDuration() is different than song duration as includes residual audio
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
			// code to stop on selection, commented because it gives problems when selecting one note
			// if (self.playTo && self.playTo != self.playFrom  && self.audio.currentTime > self.playTo){
			// 	self.stop();
			// }
			//loops on audio
			if (self.playTo !== undefined && self.audio.currentTime > self.playTo && self.audio.loop === true 
				&& !self._positionsEqual(self.playFrom,self.playTo)) {
				self.play();
			}
			

			//publish for playing bar
			var totalDuration = self.getDuration();
			var positionInPercent = self.audio.currentTime / totalDuration;
			$.publish('PlayerModel-onPosition', {
				'positionInPercent': positionInPercent,
				'songDuration': totalDuration * 1000
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
		}
		return mergedPeaks;
	};

	return WaveModel;
});