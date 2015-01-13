define([
	'mustache',
	'modules/MidiCSL/src/model/PlayerModel_MidiCSL',
	'utils/UserLog',
	'pubsub',
], function(Mustache, PlayerModel_MidiCSL, PlayerAPI, UserLog, pubsub) {

	function PlayerController(model, view) {
		this.model = model || new PlayerModel_MidiCSL();
		this.view = view;
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	PlayerController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('PlayerView-play', function(el, tempo) {
			self.play(tempo);
		});

		$.subscribe('PlayerView-stop', function(el) {
			self.stop();
		});

		$.subscribe('PlayerView-pause', function(el) {
			self.pause();
		});

		$.subscribe('PlayerView-playPause', function(el, tempo) {
			self.pause();
		});

		$.subscribe('PlayerView-onToggleMute', function(el, volume) {
			self.toggleMute(volume);
		});
		$.subscribe('PlayerView-onVolume', function(el, volume) {
			self.onVolumeChange(volume);
		});
		$.subscribe('PlayerView-onToggleMetronome', function(el, isMetronome) {
			self.metronomeChange(isMetronome);
		});
		$.subscribe('PlayerView-onTempo', function(el, tempo) {});
		$.subscribe('PlayerView-onChordInstrumentChange', function(el, instrument) {
			self.chordIntrumentChange(instrument);
		});
		$.subscribe('PlayerView-onMelodyInstrumentChange', function(el, instrument) {
			self.melodyInstrumentChange(instrument);
		});
		$.subscribe('PlayerView-toggleLoop', function(el) {
			self.toggleLoop();
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
	PlayerController.prototype.play = function(tempo) {
		this.model.play(tempo);
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

	PlayerController.prototype.onVolumeChange = function(volume) {
		this.model.setVolume(volume);
	};

	PlayerController.prototype.onChordInstrumentChange = function(instrument) {
		this.model.setChordsInstrument(instrument);
	};
	PlayerController.prototype.onMelodyInstrumentChange = function(instrument) {
		this.model.setMelodyInstrument(instrument);
	};

	/**
	 * Function is call to load the state of one Player
	 * @param  {int} currentPlayer represent the index of Player that will be loaded
	 */
	PlayerController.prototype.loadPlayer = function(currentPlayer) {
		if (typeof this.model.PlayerList[currentPlayer] === "undefined") {
			UserLog.logAutoFade('error', "No Player available");
			return;
		}
		this.model.setCurrentPosition(currentPlayer);
	};

	return PlayerController;
});