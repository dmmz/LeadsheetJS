define([
	'jquery',
	'mustache',
	'utils/UserLog',
	'pubsub',
	'text!modules/MidiCSL/src/PlayerTemplate_MidiCSL.html',
], function($, Mustache, UserLog, pubsub, PlayerTemplate_MidiCSL) {

	function PlayerView(parentHTML, imgPath, options) {
		options = options || {};
		this.displayMetronome = (typeof(options.displayMetronome) !== "undefined") ? options.displayMetronome : false;
		this.displayLoop = (typeof(options.displayLoop) !== "undefined") ? options.displayLoop : false;
		this.displayTempo = (typeof(options.displayTempo) !== "undefined") ? options.displayTempo : false;
		this.changeInstrument = (typeof(options.changeInstrument) !== "undefined") ? options.changeInstrument : false;
		this.progressBar = (typeof(options.progressBar) !== "undefined") ? options.progressBar : false;
		this.tempo = options.tempo ? options.tempo : 120;
		this.el = undefined;
		this.imgPath = imgPath;
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
				self.initController();
				self.initKeyboard();
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
		//$.get('/modules/MidiCSL/src/PlayerTemplate_MidiCSL.html', function(template) {
		var rendered = Mustache.render(PlayerTemplate_MidiCSL, {
			imgPath: self.imgPath,
			displayLoop: self.displayLoop,
			displayMetronome: self.displayMetronome,
			displayTempo: self.displayTempo,
			changeInstrument: self.changeInstrument,
			progressBar: self.progressBar,
			tempo: self.tempo
		});
		if (typeof parentHTML !== "undefined") {
			parentHTML.innerHTML = rendered;
		}
		self.el = parentHTML;
		if (typeof callback === "function") {
			callback();
		}
		//});
	};

	/**
	 * Publish event after receiving dom events
	 */
	PlayerView.prototype.initController = function() {
		var self = this;
		$('#play_button_container').click(function() {
			var tempo = self.getTempo();
			$.publish('ToPlayer-play', tempo);
		});
		$('#stop_button_container').click(function() {
			$.publish('ToPlayer-stop');
		});
		$('#pause_button_container').click(function() {
			$.publish('ToPlayer-pause');
		});

		$('#loop_button_container').click(function() {
			$.publish('ToPlayer-toggleLoop');
		});

		// .on('input') Event is fired every time the input changes (work with paste, delete, type things)
		$('#tempo_container #tempo').on('change', function() {
			var tempo = $(this).val();
			$('#pause_button_container').hide();
			$('#play_button_container').show();
			$.publish('ToPlayer-onTempo', tempo);
		});

		$('#metronome_container').click(function() {
			if ($('#metronome_container .metronome_on').is(":visible")) {
				//mute
				$.publish('ToPlayer-onToggleMetronome', false);

			} else {
				//unmute
				$.publish('ToPlayer-onToggleMetronome', true);
			}
		});

		// volume - toggle mute icons
		$('#volume_container').click(function() {
			if ($('#volume_container .sound_off').is(":visible")) {
				$.publish('ToPlayer-onToggleMute');
			} else {
				$.publish('ToPlayer-onToggleMute', 0);
			}
		});

		// volume slider
		var dragStart = false;
		$('#volume_controller_barre').bind('dragstart', function(e) {
			e.preventDefault();
			return false;
		});
		$('#volume_controller').bind('dragstart', function(e) {
			e.preventDefault();
			return false;
		});
		$('#volume_controller_barre').mousedown(function() {
			dragStart = true;
		});
		$('#volume_controller_barre').mouseup(function() {
			dragStart = false;
		});
		$('body').mouseup(function() {
			dragStart = false;
		});
		$('#volume_controller').mousemove(function(evt) {
			if (dragStart) {
				self._dragVolumeController(evt);
			}
		});
		$('#volume_controller').mousedown(function(evt) {
			self._dragVolumeController(evt);
			dragStart = true;
		});
		$('#volume_controller').mouseup(function() {
			dragStart = false;
		});
		$('#volume_controller_barre').mousemove(function(evt) {
			if (dragStart) {
				self._dragVolumeController(evt);
			}
		});

		// instument selection
		$('#chords_instrument_container select').change(function() {
			$.publish('ToPlayer-onChordInstrumentChange', $(this).val());
		});

		$('#melody_instrument_container select').change(function() {
			$.publish('ToPlayer-onMelodyInstrumentChange', $(this).val());
		});

		$('.progress_bar_player').click(function(e) {
			var width = $(this).width();
			var relX = e.pageX - $(this).parent().offset().left;
			var tempo = self.getTempo();
			$.publish('ToPlayer-playFromPercent', {
				'tempo': tempo,
				'percent': relX / width
			});

			e.preventDefault();
		});
	};

	PlayerView.prototype.initKeyboard = function() {
		var self = this;
		$.subscribe('spacebar', function(el) {
			var tempo = self.getTempo();
			$.publish('ToPlayer-playPause', tempo);
		});
	};

	/**
	 * Subscribe to model events
	 */
	PlayerView.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('PlayerModel-onplay', function(el) {
			self.play();
		});
		$.subscribe('PlayerModel-onpause', function(el) {
			self.pause();
		});
		$.subscribe('PlayerModel-onstop', function(el) {
			self.pause();
		});
		$.subscribe('PlayerModel-onfinish', function(el) {
			self.pause();
		});
		$.subscribe('PlayerModel-onloopstart', function(el) {});

		$.subscribe('PlayerModel-toggleLoop', function(el, isLoop) {
			if (isLoop) {
				self.activeLoop();
			} else {
				self.unactiveLoop();
			}
		});

		$.subscribe('PlayerModel-onvolumechange', function(el, volume) {
			self.setVolume(volume);
		});

		$.subscribe('PlayerModel-onload', function(el) {
			self.playerIsReady();
		});

		$.subscribe('PlayerModel-onChordsInstrument', function(el, instrument) {});
		$.subscribe('PlayerModel-onMelodyInstrument', function(el, instrument) {});

		$.subscribe('PlayerModel-toggleMetronome', function(el, isMetronome) {
			if (isMetronome) {
				self.muteMetronome();
			} else {
				self.unmuteMetronome();
			}
		});
		$.subscribe('PlayerModel-onPosition', function(el, obj) {
			self.updateProgressbar(obj.positionInPercent * 100, obj.songDuration);
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
		$('#play_button img').attr('src', this.imgPath + '/play.png');
		$('#play_button_container').css('color', 'black');
		$('#play_button_container .player_text').html('Play');
	};

	PlayerView.prototype.playerIsNotReady = function() {
		$('#play_button img').attr('src', this.imgPath + '/play_grey.png');
		$('#play_button_container').css('color', 'grey');
		$('#play_button_container .player_text').html('Loading');
	};


	// loop
	PlayerView.prototype.activeLoop = function() {
		$('#loop_button img').attr('src', this.imgPath + '/loop.png').attr('title', 'Loop is on');
	};

	PlayerView.prototype.unactiveLoop = function() {
		$('#loop_button img').attr('src', this.imgPath + '/loop_grey.png').attr('title', 'Loop is off');
	};


	// volume interface
	PlayerView.prototype.setVolume = function(volume) {
		if (isNaN(volume) || volume < 0) {
			return;
		}
		this.adaptSoundButton(volume);
		this.setControllerPosition(1 - volume);
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


	PlayerView.prototype.adaptSoundButton = function(volume) {
		if (volume < 0.33) {
			pic = 'sound_off';
		}
		if (0 < volume && volume <= 0.33) {
			pic = 'sound_1';
		} else if (0.33 < volume && volume <= 0.66) {
			pic = 'sound_2';
		} else if (0.66 < volume) {
			pic = 'sound_on';
		}
		if (!$('#volume_container .' + pic).is(":visible")) {
			$('#volume_container .sound_off').hide();
			$('#volume_container .sound_on').hide();
			$('#volume_container .sound_1').hide();
			$('#volume_container .sound_2').hide();
			$('#volume_container .' + pic).show();
		}
	};

	PlayerView.prototype.getTempo = function() {
		var tempo = $('#tempo_container #tempo').val();
		if (typeof tempo === "undefined") {
			tempo = 120;
		}
		return tempo;
	};


	PlayerView.prototype._convertSecondToPrintableTime = function(seconds) {
		if (isNaN(seconds)) {
			throw 'PlayerView - _convertSecondToPrintableTime, seconds is not a number ' + seconds;
		}
		var date = new Date(null);
		date.setSeconds(seconds); // specify value for SECONDS here
		return date.toISOString().substr(14, 5);
	};

	PlayerView.prototype.updateProgressbar = function(value, duration) {
		var $div = $('.progress_bar_player').find('div');
		$div.attr('aria-valuenow', value);
		$div.css('width', value + '%');
		var $span = $div.find('span');

		var currentTime = value / 100 * duration / 1000;
		var durationTime = duration / 1000;
		var ct = this._convertSecondToPrintableTime(currentTime);
		var dt = this._convertSecondToPrintableTime(durationTime);
		$span.text(ct + ' / ' + dt);
	};


	PlayerView.prototype._dragVolumeController = function(evt) {
		var heightParent = $('#volume_controller').height();
		var topPositionParent = $('#volume_controller').offset().top;
		var topPosition = evt.pageY;
		var decal = 5; // shadow of barre at the top/bottom

		var realHeight = heightParent - (2 * decal);
		var relativePosition = topPosition - topPositionParent;
		if (relativePosition < decal) {
			relativePosition = decal;
		}
		if (relativePosition > heightParent - decal) {
			relativePosition = heightParent - decal;
		}
		var volume = 1 - ((relativePosition - decal) / realHeight);
		//this.setControllerPosition((relativePosition - decal) / realHeight);
		$.publish('ToPlayer-onVolume', volume);
	};

	/**
	 * Set position of volume controller
	 * @param {float} position of controller as a float. 0(volume = 1) <= position <= 1(volume = 0)
	 */
	PlayerView.prototype.setControllerPosition = function(position) {
		var decal = 5; // shadow of barre at the top/bottom
		var heightParent = $('#volume_controller').height();
		if (heightParent === null) {
			heightParent = 68;
		}
		var realHeight = heightParent - (2 * decal);
		var relativePosition = position * realHeight;
		if (relativePosition < decal) {
			relativePosition = decal;
		}
		if (relativePosition > heightParent - decal) {
			relativePosition = heightParent;
		}
		var middleController = $('#volume_controller_barre').height() / 2; // to be at the center of controller
		$('#volume_controller_barre').css({
			top: (relativePosition - middleController) + 'px'
		});
	};

	PlayerView.prototype.hide = function() {
		this.el.style.display = "none";
	};

	PlayerView.prototype.show = function() {
		this.el.style.display = "inline-block";
	};


	return PlayerView;
});