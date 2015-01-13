define([
	'mustache',
	'utils/UserLog',
	'pubsub',
	'external-libs/bootstrap/bootstrap.min',
	'external-libs/bootstrap/bootstrap-slider',
], function(Mustache, UserLog, pubsub, bootstrap, slider) {

	function PlayerView(parentHTML, option) {
		this.displayMetronome = (typeof (option) !== "undefined" && typeof (option.displayMetronome) !== "undefined") ? option.displayMetronome : false;
		this.displayLoop = (typeof (option) !== "undefined" && typeof (option.displayLoop) !== "undefined") ? option.displayLoop : false;
		this.displayTempo = (typeof (option) !== "undefined" && typeof (option.displayTempo) !== "undefined") ? option.displayTempo : false;
		this.changeInstrument = (typeof (option) !== "undefined" && typeof (option.changeInstrument) !== "undefined") ? option.changeInstrument : false;
		this.el = undefined;
		this.initSubscribe();
		var self = this;
		this.render(parentHTML, true);
	}

	PlayerView.prototype.render = function(parentHTML, force, callback) {
		force = force || false;
		// case el has never been rendered
		var self = this;
		if (typeof this.el === "undefined" || (typeof this.el !== "undefined" && force === true)) {
			this.initView(parentHTML, function() {
				self.initTemplate();
				self.initController();
				$.publish('PlayerView-render');
				if (typeof callback === "function") {
					callback();
				}
				return;
			});
		} else {
			if (typeof callback === "function") {
				callback();
			}
			return;
		}
	};

	PlayerView.prototype.initView = function(parentHTML, callback) {
		var self = this;
		$.get('/modules/MidiCSL/src/PlayerTemplate_MidiCSL.html', function(template) {
			var rendered = Mustache.render(template,
				{
					displayLoop: self.displayLoop,
					displayMetronome: self.displayMetronome,
					displayTempo: self.displayTempo,
					changeInstrument: self.changeInstrument,
				}
			);
			if (typeof parentHTML !== "undefined") {
				parentHTML.innerHTML = rendered;
			}
			self.el = rendered;
			if (typeof callback === "function") {
				callback();
			}
		});
	};

	PlayerView.prototype.initTemplate = function() {
		// init tempo
		var tempo = this.getTempo();

		if (typeof globalVariables !== "undefined" && globalVariables.tempo !== "undefined" && globalVariables.tempo !== null) {
			var minTempo = parseInt(globalVariables.tempo['minTempo'], 10);
			var maxTempo = parseInt(globalVariables.tempo['maxTempo'], 10);
			var range = maxTempo - minTempo;
			tempo = Math.round((Math.random() * range) + minTempo);
			$('#tempo_container #tempo').val(tempo);
		}
	};

	/**
	 * Publish event after receiving dom events
	 */
	PlayerView.prototype.initController = function() {
		var self = this;
		$('#play_button_container').click(function() {
			var tempo = self.getTempo();
			$.publish('PlayerView-play', tempo);
		});
		$('#stop_button_container').click(function() {
			$.publish('PlayerView-stop');
		});
		$('#pause_button_container').click(function() {
			$.publish('PlayerView-pause');
		});

		$('#loop_button_container').click(function() {
			$.publish('PlayerView-toggleLoop');
		});

		// .on('input') Event is fired every time the input changes (work with paste, delete, type things)
		$('#tempo_container #tempo').on('change', function() {
			var tempo = $(this).val();
			$('#pause_button_container').hide();
			$('#play_button_container').show();
			$.publish('PlayerView-onTempo', tempo);
		});

		$('#metronome_container').click(function() {
			if ($('#metronome_container .metronome_on').is(":visible")) {
				//mute
				$.publish('PlayerView-onToggleMetronome', false);

			} else {
				//unmute
				$.publish('PlayerView-onToggleMetronome', true);
			}
		});

		$('#volume_container').click(function() {
			if ($('#volume_container .sound_on').is(":visible")) {
				$.publish('PlayerView-onToggleMute', 0);
			} else {
				$.publish('PlayerView-onToggleMute');
			}
		});

		$('.volume_slider').slider().on('slide', function(evt) {
			$.publish('PlayerView-onVolume', evt.value / 100);
		});

		$('#chords_instrument_container select').change(function() {
			$.publish('PlayerView-onChordInstrumentChange', $(this).val());
		});

		$('#melody_instrument_container select').change(function() {
			$.publish('PlayerView-onMelodyInstrumentChange', $(this).val());
		});

		$(document).keydown(function(evt) {
			if (evt.keyCode == 32) { //barPressed
				var d = evt.srcElement || evt.target;
				if (!(d.tagName.toUpperCase() === 'TEXTAREA' || (d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE')))) {
					var tempo = self.getTempo();
					$.publish('PlayerView-play-pause', tempo);
					evt.preventDefault();
				}
			}
		});
	};


	/**
	 * Subscribe to model events
	 */
	PlayerView.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('PlayerModel_MidiCSL-onplay', function(el) {
			self.play();
		});
		$.subscribe('PlayerModel_MidiCSL-onpause', function(el) {
			self.pause();
		});
		$.subscribe('PlayerModel_MidiCSL-onstop', function(el) {
			self.pause();
		});
		$.subscribe('PlayerModel_MidiCSL-onfinish', function(el) {
			self.pause();
		});
		$.subscribe('PlayerModel_MidiCSL-onloopstart', function(el) {});

		$.subscribe('PlayerModel_MidiCSL-toggleLoop', function(el, isLoop) {
			if (isLoop) {
				self.activeLoop();
			} else {
				self.unactiveLoop();
			}
		});

		$.subscribe('PlayerModel_MidiCSL-onvolumechange', function(el, volume) {
			self.setVolume(volume);
		});

		$.subscribe('PlayerModel_MidiCSL-onload', function(el) {
			self.playerIsReady();
		});

		$.subscribe('PlayerModel_MidiCSL-onChordsInstrument', function(el, instrument) {});
		$.subscribe('PlayerModel_MidiCSL-onMelodyInstrument', function(el, instrument) {});

		$.subscribe('PlayerModel_MidiCSL-toggleMetronome', function(el, isMetronome) {
			if (isMetronome) {
				self.muteMetronome();
			} else {
				self.unmuteMetronome();
			}
		});
	};


	// play / pause
	PlayerView.prototype.play = function() {
		$('#pause_button_container').show();
		$('#pause_button_container').css('display', 'inline-block');
		$('#play_button_container').hide();
	};

	PlayerView.prototype.pause = function() {
		$('#pause_button_container').hide();
		$('#play_button_container').show();
	};


	// ready
	PlayerView.prototype.playerIsReady = function() {
		$('#play_button img').attr('src', '/modules/MidiCSL/img/play.png');
		$('#play_button_container').css('color', 'black');
		$('#play_button_container .player_text').html('Play');
	};

	PlayerView.prototype.playerIsNotReady = function() {
		$('#play_button img').attr('src', '/modules/MidiCSL/img/play_grey.png');
		$('#play_button_container').css('color', 'grey');
		$('#play_button_container .player_text').html('Loading');
	};


	// loop
	PlayerView.prototype.activeLoop = function() {
		$('#loop_button img').attr('src', '/modules/MidiCSL/img/loop.png').attr('title', 'Loop is on');
	};

	PlayerView.prototype.unactiveLoop = function() {
		$('#loop_button img').attr('src', '/modules/MidiCSL/img/loop_grey.png').attr('title', 'Loop is off');
	};


	// volume interface
	PlayerView.prototype.setVolume = function(volume) {
		if (isNaN(volume) || volume < 0) {
			return;
		}
		if (volume === 0) {
			this.muteSoundButton();
		} else {
			this.unmuteSoundButton();
		}
		$('.volume_slider').slider('setValue', Math.round(volume * 100));
	};

	// metronome
	PlayerView.prototype.muteMetronome = function() {
		$('#metronome_container .metronome_off').hide();
		$('#metronome_container .metronome_on').show();
	};

	PlayerView.prototype.unmuteMetronome = function() {
		$('#metronome_container .metronome_on').hide();
		$('#metronome_container .metronome_off').show();
	};


	// mute
	PlayerView.prototype.muteSoundButton = function() {
		$('#volume_container .sound_off').show();
		$('#volume_container .sound_on').hide();
	};

	PlayerView.prototype.unmuteSoundButton = function() {
		if ($('#volume_container .sound_off').is(":visible")) {
			$('#volume_container .sound_off').hide();
			$('#volume_container .sound_on').show();
		}
	};

	PlayerView.prototype.getTempo = function() {
		var tempo = $('#tempo_container #tempo').val();
		if(typeof tempo === "undefined") {
			tempo = 120;
		}
		return tempo;
	};

	return PlayerView;
});