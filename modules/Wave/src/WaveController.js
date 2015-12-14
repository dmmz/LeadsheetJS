define(['modules/Wave/src/WaveModel',
	'modules/Wave/src/WaveDrawer',
	'modules/Wave/src/BarTimesManager',
	'modules/core/src/SongBarsIterator',
	'jquery',
	'pubsub'
], function(WaveModel, WaveDrawer, BarTimesManager, SongBarsIterator, $, pubsub) {
	/**
	 * @exports Wave/WaveController
	 * @param {SongModel} songModel
	 * @param {cursorNotes} cursor     // notes cursor, it is updated when playing
	 * @param {LSViewer} viewer
	 * @param {Object} params :
	 *   - showHalfWave: show only the half of the waveform like in soundcloud
	 *   - drawMargins: show the margin of the are in which the audio is drawn (for debug purposes)
	 *   - topAudio: y distance to the actual bar from which audio is drawn, if 0 it will overwrite the current bar
	 *   - heightAudio: height of the audio area, if 150 it will completely overwrite the current bar in the score
	 */
	function WaveController(songModel, viewer, cursor, params) {
		if (!songModel) {
			throw "WaveController - songModel not defined";
		}
		// if (!cursor) {
		//     throw "WaveController - cursor not defined";
		// }
		if (!viewer) {
			throw "WaveController - viewer not defined";
		}

		params = params || {};

		this.barTimesMng = new BarTimesManager();
		this.songModel = songModel;
		this.cursorNotes = cursor;
		this.isLoaded = false;
		this.viewer = viewer;
		this.model = new WaveModel(songModel.getComponent('notes').getTotalDuration());
		this.file = params.file;
		this.tempo = params.tempo;
		var paramsDrawer = {
			pixelRatio: window.devicePixelRatio,
			showHalfWave: params.showHalfWave,
			drawMargins: params.drawMargins,
			topAudio: params.topAudio,
			heightAudio: params.heightAudio,
			marginCursor: params.marginCursor
		};
		this.drawer = new WaveDrawer(viewer, paramsDrawer, this);
		this._initSubscribe();
	}

	WaveController.prototype._initSubscribe = function() {
		var self = this;
		//when window is resized, leadsheet is drawn, and audio needs to be redrawn too
		$.subscribe('LSViewer-drawEnd', function() {
			if (!self.model.isDrawingEnabled) {
				return;
			}
			if (self.isLoaded && !isNaN(self.model.getDuration())) {
				self.drawer.drawAudio(self.barTimesMng, self.model.tempo, self.model.getDuration());
			} else if (self.file && self.tempo) {
				self.load(self.file, self.tempo);
			}
		});
		$.subscribe("ToWave-setCursor", function (el, cursorStart, cursorEnd) {
				var beats = self.songModel.getComponent('notes').getBeatIntervalByIndexes(cursorStart, cursorEnd);
				var startTime = self.model.beatDuration * (beats[0] - 1);
				var endTime = self.model.beatDuration * (beats[1] - 1);
				if (self.drawer.cursor){	
					self.drawer.cursor.setPos([startTime,endTime]);	
					self.drawer.updateCursorPlaying(startTime);
				}
		});
		$.subscribe("ToPlayer-play", function() {
			self.play();
		});
		$.subscribe('ToPlayer-playFromPercent', function(el, obj) {
			self.playFromPercent(obj.percent);
		});
		$.subscribe("ToPlayer-pause", function() {
			self.pause();
		});
		$.subscribe('ToPlayer-stop', function() {
			self.stop();
		});

		$.subscribe('ToPlayer-playPause', function() {
			self.playPause();
		});

		$.subscribe('ToPlayer-onToggleMute', function(el, volume) {
			self.toggleMute(volume);
		});
		$.subscribe('ToPlayer-onVolume', function(el, volume) {
			self.onVolumeChange(volume);
		});

		$.subscribe('ToPlayer-toggleLoop', function() {
			self.toggleLoop();
		});

		$.subscribe("ToLayers-removeLayer", function() {
			self.disable();
		});

		$.subscribe('ToAudioPlayer-enable', function() {
			self.model.enablePlaying();
		});
		$.subscribe('ToAudioPlayer-disable', function() {
			self.model.disablePlaying();
		});

		$.subscribe('ToPlayer-disableAll', function() {
			self.disable();
		});

		$.subscribe('PlayerModel-playing', function() {
			self.restartAnimationLoop();
		});

		/*
				$.subscribe('PlayerView-render', function(el) {
					self.initView();
				});
		*/
	};


	/**
	 * Function playpause call play if player is in pause, and call pause if player is in play state
	 * @param  {int} tempo in BPM
	 */
	WaveController.prototype.playPause = function() {
		if (!this.model.audio.paused) {
			this.pause();
		} else {
			this.play(); 
		}
	};
	WaveController.prototype.play = function() {
		if (this.isLoaded) {
			this.isPause = false;
			var curPos = this.drawer.cursor.getPos();
			
			if (curPos[0] || curPos[1]) // when no cursor, position is [0,0], in that case we don't set positions
			{ 
				this.model.setPlayFromTo(curPos[0], curPos[1]);
			}
			this.model.play();
		}
	};

	WaveController.prototype.playFromPercent = function(percent) {
		if (this.isLoaded) {
			var timeSec = this.model.getDuration() * percent;
			this.isPause = false;
			this.model.play(timeSec);
		}
	};

	WaveController.prototype.pause = function() {
		if (this.isLoaded) {
			this.isPause = true;
			this.model.pause();
		}
	};

	WaveController.prototype.stop = function() {
		this.isPause = true;
		this.model.stop();
		this.drawer.updateCursorPlaying(0);
		this.drawer.viewer.canvasLayer.refresh();
	};
	WaveController.prototype.onVolumeChange = function(volume) {
		this.model.setVolume(volume);
		/* if (volume === 0) {
			 this.model.mute();
		 } else {
			 this.model.setVolume(volume);
		 }*/
	};

	WaveController.prototype.toggleLoop = function() {
		this.model.toggleLoop();
	};


	WaveController.prototype.getPlayedTime = function() {
		//var dur = this.buffer.duration;
		return this.model.audio.currentTime;
	};

	WaveController.prototype.toggleMute = function(volume) {
		if (volume === 0) {
			this.model.mute();
		} else {
			this.model.unmute();
		}
	};

	WaveController.prototype.load = function(url, tempo, redraw, callback) {
		if (isNaN(tempo) || tempo <= 0) {
			throw "WaveController - No tempo speficied";
		}

		var self = this;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.responseType = 'arraybuffer';
		xhr.withCredentials = false;

		xhr.onload = function() {
			var audioData = xhr.response;
			self.model.load(url, audioData, tempo, function() {
				self.isLoaded = true;
				self.enable();
				self.barTimesMng.setBarTimes(self.songModel, self.model);
				self.drawer.newCursor(self.model);
				self.drawer.adaptViewer();
				if (redraw) {
					self.viewer.setShortenLastBar(true);
					self.viewer.draw(self.songModel); // no need to drawAudio(), as it is called on 'drawEnd'
				} else {
					self.drawer.drawAudio(self.barTimesMng, tempo, self.model.getDuration());
				}
				$.publish('Audio-loaded');
				if (typeof callback !== "undefined") {
					callback();
				}
			});
		};
		xhr.send();
	};

	WaveController.prototype.enable = function() {
		this.model.enable();
	};

	WaveController.prototype.disable = function() {
		this.model.disable();
		this.viewer.setShortenLastBar(false);
		this.viewer.resetLinesHeight();
		this.viewer.draw(this.songModel); // no need to drawAudio(), as it is called on 'drawEnd'
		$.publish('Audio-disabled');
	};

	WaveController.prototype.restartAnimationLoop = function() {
		var self = this;
		var noteMng = this.songModel.getComponent('notes');
		var iNote = 0,
			prevINote = 0,
			time;
		var minBeatStep = this.model.beatDuration / 32; //we don't want to update notes cursor as often as we update audio cursor, to optimize we only update note cursor every 1/32 beats
		var requestFrame = window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame;
		this.startTime = this.model.audio.currentTime;
		var timeStep = 0;
		var barIndex = 0;
		var frame = function() {
			if (!self.isPause) {
				if (self.getPlayedTime() >= timeStep + minBeatStep) {

					//we update note cursor
					iNote = noteMng.getPrevIndexNoteByBeat(self.getPlayedTime() / self.model.beatDuration + 1);
					if (iNote != prevINote && self.cursorNotes && iNote < self.cursorNotes.getListLength()) { //if cursorNotes is not defined (or null) we don't use it (so audioPlayer works and is not dependent on cursor)
						
						self.cursorNotes.setPos(iNote);
						prevINote = iNote;
					}
					timeStep += minBeatStep;

				}
				time = self.getPlayedTime();
				barIndex = self.barTimesMng.getBarIndexByTime(time, barIndex);

				// To avoid problems when finishing audio, we play while barIndex is in barTimesMng, if not, we pause
				if (barIndex < self.barTimesMng.getLength()) {
					self.drawer.updateCursorPlaying(time, barIndex);
					self.drawer.viewer.canvasLayer.refresh();
					requestFrame(frame);
				} else {
					self.pause();
				}
			}
		};
		frame();
	};



	/**
	 * Function is call to load the state of the player
	 */
	/*WaveController.prototype.initView = function() {
		$.publish('PlayerModel-onvolumechange', this.model.volume);
	};*/



	return WaveController;
});