define([
	'mustache',
	'utils/UserLog',
	'pubsub',
	'bootstrap',
], function(Mustache, UserLog, pubsub, bootstrap) {

	function PlayerView(parentHTML, option) {
		this.displayMetronome = (typeof(option) !== "undefined" && typeof(option.displayMetronome) !== "undefined") ? option.displayMetronome : false;
		this.displayLoop = (typeof(option) !== "undefined" && typeof(option.displayLoop) !== "undefined") ? option.displayLoop : false;
		this.displayTempo = (typeof(option) !== "undefined" && typeof(option.displayTempo) !== "undefined") ? option.displayTempo : false;
		this.changeInstrument = (typeof(option) !== "undefined" && typeof(option.changeInstrument) !== "undefined") ? option.changeInstrument : false;
		this.progressBar = (typeof(option) !== "undefined" && typeof(option.progressBar) !== "undefined") ? option.progressBar : false;
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
			var rendered = Mustache.render(template, {
				displayLoop: self.displayLoop,
				displayMetronome: self.displayMetronome,
				displayTempo: self.displayTempo,
				changeInstrument: self.changeInstrument,
				progressBar: self.progressBar,
			});
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

		// volume - toggle mute icons
		$('#volume_container').click(function() {
			if ($('#volume_container .sound_off').is(":visible")) {
				$.publish('PlayerView-onToggleMute');
			} else {
				$.publish('PlayerView-onToggleMute', 0);
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
			$.publish('PlayerView-onChordInstrumentChange', $(this).val());
		});

		$('#melody_instrument_container select').change(function() {
			$.publish('PlayerView-onMelodyInstrumentChange', $(this).val());
		});

		$('.progress_bar_player').click(function(e) {
			var width = $(this).width();
			var relX = e.pageX - $(this).parent().offset().left;
			var tempo = self.getTempo();
			$.publish('PlayerView-playFromPercent', {
				'tempo': tempo,
				'percent': relX / width
			});

			e.preventDefault();
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
		$.subscribe('PlayerModel_MidiCSL-onPosition', function(el, obj) {
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
		if(volume < 0.33 ){
			pic = 'sound_off';
		}
		if( 0 < volume && volume <= 0.33 ){
			pic = 'sound_1';
		}
		else if( 0.33 < volume && volume <= 0.66 ){
			pic = 'sound_2';
		}
		else if( 0.66 < volume){
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
		$.publish('PlayerView-onVolume', volume);
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

	return PlayerView;
});