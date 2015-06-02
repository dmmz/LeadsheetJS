define([
	'jquery',
	'mustache',
	'modules/MidiCSL/src/model/PlayerModel_MidiCSL',
	'utils/UserLog',
	'pubsub',
], function($, Mustache, PlayerModel_MidiCSL, UserLog, pubsub) {

	function PlayerController(model, view) {
		this.model = model || new PlayerModel_MidiCSL();
		this.view = view;
		this.initView();
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	PlayerController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('ToPlayer-play', function(el, tempo) {
			self.play(tempo);
		});
		$.subscribe('ToPlayer-playFromPercent', function(el, obj) {
			self.playFromPercent(obj.tempo, obj.percent);
		});

		$.subscribe('ToPlayer-stop', function(el) {
			self.stop();
		});

		$.subscribe('ToPlayer-pause', function(el) {
			self.pause();
		});

		$.subscribe('ToPlayer-playPause', function(el, tempo) {
			self.pause();
		});

		$.subscribe('ToPlayer-onToggleMute', function(el, volume) {
			self.toggleMute(volume);
		});
		$.subscribe('ToPlayer-onVolume', function(el, volume) {
			self.onVolumeChange(volume);
		});
		$.subscribe('ToPlayer-onToggleMetronome', function(el, isMetronome) {
			self.metronomeChange(isMetronome);
		});
		$.subscribe('ToPlayer-onTempo', function(el, tempo) {
			self.onTempoChange(tempo);
		});
		$.subscribe('ToPlayer-onChordInstrumentChange', function(el, instrument) {
			self.onChordInstrumentChange(instrument);
		});
		$.subscribe('ToPlayer-onMelodyInstrumentChange', function(el, instrument) {
			self.onMelodyInstrumentChange(instrument);
		});
		$.subscribe('ToPlayer-toggleLoop', function(el) {
			self.toggleLoop();
		});

		$.subscribe('PlayerView-render', function(el) {
			self.initView();
		});
	};

	/**
	 * Function playpause call play if player is in pause, and call pause if player is in play state
	 * @param  {int} tempo in BPM
	 */
	PlayerController.prototype.playPause = function(tempo) {
		if (this.model.playState) {
			this.model.pause();
		} else {
			this.model.play(tempo);
		}
	};

	PlayerController.prototype.playFromPercent = function(tempo, percent) {
		var timeSec = this.model.getSongDuration() * percent;
		this.model.play(tempo, timeSec);
	};

	PlayerController.prototype.play = function(tempo, playFrom) {
		this.model.play(tempo, playFrom);
	};

	PlayerController.prototype.stop = function() {
		this.model.stop();
	};

	PlayerController.prototype.pause = function() {
		this.model.pause();
	};

	PlayerController.prototype.tempoChange = function(tempo) {
		this.model.setTempo(tempo);
		this.model.stop();
	};

	PlayerController.prototype.toggleLoop = function(volume) {
		this.model.toggleLoop();
	};

	PlayerController.prototype.toggleMute = function(volume) {
		if (volume === 0) {
			this.model.mute();
		} else {
			this.model.unmute();
		}
	};


	PlayerController.prototype.metronomeChange = function(isMetronome) {
		if (isMetronome) {
			this.model.unmuteMetronome();
		} else {
			this.model.muteMetronome();
		}
	};

	PlayerController.prototype.onTempoChange = function(tempo) {
		this.model.setTempo(tempo);
	};

	PlayerController.prototype.onVolumeChange = function(volume) {
		if (volume === 0) {
			this.model.mute();
		} else {
			this.model.setVolume(volume);
		}
	};

	PlayerController.prototype.onChordInstrumentChange = function(instrument) {
		this.model.setChordsInstrument(instrument);
	};
	PlayerController.prototype.onMelodyInstrumentChange = function(instrument) {
		this.model.setMelodyInstrument(instrument);
	};

	/**
	 * Function is call to load the state of the player
	 */
	PlayerController.prototype.initView = function() {
		$.publish('PlayerModel_MidiCSL-onvolumechange', this.model.getMelodyVolume());
	};

	return PlayerController;
});