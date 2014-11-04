/**
 * Publishable Events
 * PlayerModel_MidiCSL-onload
 * PlayerModel_MidiCSL-onplay
 * PlayerModel_MidiCSL-onstop
 * PlayerModel_MidiCSL-onpause
 * PlayerModel_MidiCSL-onloopstart
 * PlayerModel_MidiCSL-onfinish
 * PlayerModel_MidiCSL-onvolumechange
 */

define(['modules/MidiCSL/src/model/SongModel_MidiCSL', 'Midijs', 'pubsub'], function(SongModel_MidiCSL, MIDI, pubsub) {
	/* option contain
		editor 				// Score Editor Object, it is use mainly for viewer to display cursor
		chordsInstrument
		melodyInstrument
		loop 				// make the player loop over and over
		activeMetronome		// Boolean that indicates whether the metronome is active or not
		volume 				// Float Main volume for all instruments it vary between 0 and 1
	*/
	function PlayerModel_MidiCSL(option) {
		this.isReady = false; // boolean that indicates if player is ready to be played
		this.indexPosition = 0; // represent which notes have been lastly played
		this.playState = false; // playState indicate if the player is currently playing or not, (paused player will return false)

		var initVolume = (typeof option !== "undefined" && typeof(option.volume) !== "undefined") ? option.volume : 1;
		this.chords = {
			volume: initVolume,
			tmpVolume: initVolume,
			instrument: (typeof option !== "undefined" && typeof(option.chordsInstrument) !== "undefined") ? option.chordsInstrument : 0,
		};
		this.melody = {
			volume: initVolume,
			tmpVolume: initVolume,
			instrument: (typeof option !== "undefined" && typeof(option.melodyInstrument) !== "undefined") ? option.melodyInstrument : 0,
		};
		this.activeMetronome = (typeof option !== "undefined" && typeof(option.activeMetronome) !== "undefined") ? option.activeMetronome : false;
		// When loop attributes is set to true, player will restart after the last note (indefinitively)
		this.loop = (typeof option !== "undefined" && typeof option.loop !== "undefined") ? option.loop : false;

		if (typeof option !== "undefined" && typeof option.editor !== "undefined") {
			this.editor = option.editor;
			this.showCursorBool = (typeof option !== "undefined" && typeof option.showCursorBool !== "undefined") ? option.showCursorBool : true;
		} else {
			this.showCursorBool = false;
		}

		this.autoload = (typeof option !== "undefined" && typeof option.autoload !== "undefined") ? option.autoload : true;
		if (!!this.autoload) {
			this.load();
		}
		this._startTime = 0; // it contain the start timestamp  (when play is pressed), (it change only if player is in pause)
	};

	PlayerModel_MidiCSL.prototype.load = function() {
		if (typeof MIDI !== "undefined") {
			this.instrumentsIndex = this.getAllInstrumentsIndex();
			this.instrumentsName = this.getAllInstrumentsName();
			this.initMidiChannels(this.instrumentsIndex);
			this.initMidiPlugin(this.instrumentsName);
		}
	};

	PlayerModel_MidiCSL.prototype.getReady = function() {
		return this.isReady;
	}

	PlayerModel_MidiCSL.prototype.setReady = function(isReady) {
		if (typeof isReady !== "undefined") {
			this.isReady = isReady;
		}
	}

	PlayerModel_MidiCSL.prototype.getPlayState = function() {
		return this.playState;
	}

	PlayerModel_MidiCSL.prototype.doLoop = function() {
		return this.loop;
	}

	PlayerModel_MidiCSL.prototype.setLoop = function(loop) {
		if (typeof loop !== "undefined") {
			this.loop = !!loop;
			return true;
		} else {
			return false;
		}
	}

	PlayerModel_MidiCSL.prototype.toggleLoop = function(loop) {
		if (this.loop === true) {
			this.loop = false;
		} else {
			this.loop = true;
		}
		return this.loop;
	}

	PlayerModel_MidiCSL.prototype.mute = function() {
		this.chords.tmpVolume = this.getChordsVolume();
		this.melody.tmpVolume = this.getMelodyVolume();
		this.setChordsVolume(0);
		this.setMelodyVolume(0);
	}

	PlayerModel_MidiCSL.prototype.unmute = function() {
		this.setChordsVolume(this.chords.tmpVolume);
		this.setMelodyVolume(this.melody.tmpVolume);
	}

	PlayerModel_MidiCSL.prototype.doMetronome = function() {
		return this.activeMetronome;
	}

	PlayerModel_MidiCSL.prototype.muteMetronome = function() {
		this.activeMetronome = false;
	}

	PlayerModel_MidiCSL.prototype.unmuteMetronome = function() {
		this.activeMetronome = true;
	}

	PlayerModel_MidiCSL.prototype.setVolume = function(volume) {
		if (typeof volume === "undefined" || isNaN(volume)) {
			throw 'PlayerModel_MidiCSL - setVolume - volume must be a number ' + volume;
		}
		$.publish('PlayerModel_MidiCSL-onvolumechange', volume);
		this.setMelodyVolume(volume);
		this.setChordsVolume(volume);
	};

	PlayerModel_MidiCSL.prototype.getChordsVolume = function() {
		return this.chords.volume;
	}

	PlayerModel_MidiCSL.prototype.setChordsVolume = function(volume) {
		if (typeof volume === "undefined" || isNaN(volume)) {
			throw 'PlayerModel_MidiCSL - setChordsVolume - volume must be a number ' + volume;
		}
		/*MIDI.setVolume(1, volume * 127);*/
		this.chords.volume = volume;
	}

	PlayerModel_MidiCSL.prototype.getMelodyVolume = function() {
		return this.melody.volume;
	}

	PlayerModel_MidiCSL.prototype.setMelodyVolume = function(volume) {
		if (typeof volume === "undefined" || isNaN(volume)) {
			throw 'PlayerModel_MidiCSL - setMelodyVolume - volume must be a number ' + volume;
		}
		/*MIDI.setVolume(0, volume * 127);*/
		this.melody.volume = volume;
	}

	PlayerModel_MidiCSL.prototype.getChordsInstrument = function() {
		return this.chords.instrument;
	};

	PlayerModel_MidiCSL.prototype.setChordsInstrument = function(instrument) {
		if (typeof instrument !== "undefined") {
			this.chords.instrument = instrument;
			return true;
		} else {
			return false;
		}
	}

	PlayerModel_MidiCSL.prototype.getMelodyInstrument = function() {
		return this.melody.instrument;
	}

	PlayerModel_MidiCSL.prototype.setMelodyInstrument = function(instrument) {
		if (typeof instrument !== "undefined") {
			this.melody.instrument = instrument;
			return true;
		} else {
			return false;
		}
	}

	PlayerModel_MidiCSL.prototype.getPositionIndex = function() {
		return this.indexPosition;
	}

	PlayerModel_MidiCSL.prototype.setPositionIndex = function(indexPosition) {
		if (typeof indexPosition === "undefined" || isNaN(indexPosition)) {
			throw 'PlayerModel_MidiCSL - setPositionIndex - indexPosition must be a number ' + indexPosition;
		}
		this.indexPosition = indexPosition;
	}

	/*PlayerModel_MidiCSL.prototype.setPositionInPercent = function(positionInPercent) {
		console.log(positionInPercent);
		if (typeof positionInPercent === "undefined" || isNaN(positionInPercent)) {
			throw 'PlayerModel_MidiCSL - setPositionInPercent - positionInPercent must be a float ' + positionInPercent;
		}
		this.positionInPercent = positionInPercent;
	}*/

	/**
	 * Give position of player in the song
	 * @return {float} between 0 (not started) and 1 (finished)
	 */
	PlayerModel_MidiCSL.prototype.getPosition = function() {
		if(typeof this._startTime === "undefined" || isNaN(this._startTime) || typeof this.songDuration === "undefined" || isNaN(this.songDuration)){
			throw 'PlayerModel_MidiCSL - getPosition - _startTime and songDuration must be numbers ' + this._startTime + ' ' + this.songDuration;
		}
		var position = (Date.now() - this._startTime) / this.songDuration;
		if(position > 1){
			position = 1;
		}
		return position;
	}



	PlayerModel_MidiCSL.prototype.getBeatDuration = function(tempo) {
		if (typeof tempo === "undefined" || isNaN(tempo)) {
			throw 'PlayerModel_MidiCSL - getBeatDuration - tempo must be a number ' + tempo;
		}
		return 1000 * (60 / tempo);
	}


	PlayerModel_MidiCSL.prototype.play = function(songModel_MidiCSL, tempo) {
		if (typeof tempo === "undefined" || isNaN(tempo)) {
			throw 'PlayerModel_MidiCSL - play - tempo must be a number ' + tempo;
		}
		if (typeof songModel_MidiCSL === "undefined" || !(songModel_MidiCSL instanceof SongModel_MidiCSL)) {
			throw 'PlayerModel_MidiCSL - play - songModel_MidiCSL must be an instance of SongModel_MidiCSL ' + songModel_MidiCSL;
		}
		var song = songModel_MidiCSL.getSong();
		if (song.length !== 0 && this.getReady() === true) {
			$.publish('PlayerModel_MidiCSL-onplay');
			this.playState = true;

			var self = this;
			var beatDuration = this.getBeatDuration(tempo);
			var lastCurrentTimeBeforePaused = song[this.indexPosition].getCurrentTime() * beatDuration;
			this._startTime = Date.now() - lastCurrentTimeBeforePaused;

			this.noteTimeOut = []; // Keep every setTimeout so we can clear them on pause/stop
			var lastNote = songModel_MidiCSL.getLastNote(); // Looking for last note

			var beatOfLastNoteOff = lastNote.getCurrentTime() + lastNote.getDuration();
			var endTime = beatOfLastNoteOff * beatDuration + Date.now();
			this.songDuration = endTime - this._startTime;

			var velocityMin = 80;
			var randomVelocityRange = 40;

			var realIndex = 0;
			var metronomeChannel = 2;

			var currentNote, currentMidiNote, duration, velocityNote, channel, volume;
			var playNote = false;
			// for each different position in the song
			for (var i = this.indexPosition, c = song.length; i < c; i++) {
				currentNote = song[i];
				if (currentNote && (currentNote.getCurrentTime() * beatDuration) >= lastCurrentTimeBeforePaused) {
					// for each notes on a position (polyphonic song will have j > 1)
					for (var j = 0, v = currentNote.getMidiNote().length; j < v; j++) {
						(function(currentNote, realIndex, i, j) {
							self.noteTimeOut[realIndex] = setTimeout(function() {
								if (currentNote.getMidiNote() === "undefined") {
									return;
								}
								currentMidiNote = currentNote.getMidiNote()[j];
								playNote = false;
								/*if(currentMidiNote === false){}// Silence
							else {*/
								if (currentNote.getType() == "melody") {
									channel = self.getMelodyInstrument();
									volume = 127 * self.getMelodyVolume();
									velocityNote = Math.random() * randomVelocityRange + velocityMin;
									playNote = true;
								} else if (currentNote.getType() == "chord") {
									channel = self.getChordsInstrument();
									volume = 80 * self.getChordsVolume();
									velocityNote = Math.random() * randomVelocityRange + velocityMin;
									MIDI.setVolume(channel, 80 * self.getChordsVolume());
									playNote = true;
								} else if (currentNote.getType() == "metronome" && self.doMetronome() == true) {
									channel = metronomeChannel;
									volume = 127 * self.getMelodyVolume();
									velocityNote = Math.random() * randomVelocityRange + velocityMin;
									playNote = true;
								}
								if (playNote === true) {
									MIDI.setVolume(channel, volume);
									duration = currentNote.getDuration() * (60 / tempo);
									MIDI.noteOn(channel, currentMidiNote, velocityNote);
									MIDI.noteOff(channel, currentMidiNote, duration);
								}
								if (currentNote.getType() == "melody") {
									self.setPositionIndex(i);
									//self.setPositionInPercent((Date.now() - self._startTime) / self.songDuration);
									//self.setPositionInPercent(currentNote.getCurrentTime()/beatOfLastNoteOff);
								}
								/*}*/
								if (currentNote == lastNote) {
									setTimeout((function() {
										self.setPositionIndex(0);
										//self.setPositionInPercent(0);
										if (self.doLoop() === false) {
											$.publish('PlayerModel_MidiCSL-onfinish');
											self.stop();
										} else {
											$.publish('PlayerModel_MidiCSL-onloopstart');
											self.play(song, tempo);
										}
									}), duration * 1000);
								}
							}, currentNote.getCurrentTime() * self.getBeatDuration(tempo) - lastCurrentTimeBeforePaused);
						})(currentNote, realIndex, i, j);
						realIndex++;
					}
				}
			}
		}
	}


	PlayerModel_MidiCSL.prototype.pause = function() {
		this.playState = false;
		if (typeof MIDI.stopAllNotes !== "undefined") {
			MIDI.stopAllNotes();
		}
		// melody and metronome
		for (var i in this.noteTimeOut) {
			window.clearTimeout(this.noteTimeOut[i]);
		}
		$.publish('PlayerModel_MidiCSL-onpause');
	}

	PlayerModel_MidiCSL.prototype.stop = function() {
		this.playState = false;
		if (typeof MIDI.stopAllNotes !== "undefined") {
			MIDI.stopAllNotes();
		}
		for (var i in this.noteTimeOut) {
			window.clearTimeout(this.noteTimeOut[i]);
		}
		this.setPositionIndex(0);
		$.publish('PlayerModel_MidiCSL-onstop');
	}


	PlayerModel_MidiCSL.prototype.getAllInstruments = function() {
		// check MIDI/Plugin.js for number (you have to remove 1)
		var instruments = {
			0: "acoustic_grand_piano",
			/*		27 : "electric_guitar_clean",
		30 : "distortion_guitar",
		24 : "acoustic_guitar_nylon",
		25 : "acoustic_guitar_steel",
		26 : "electric_guitar_jazz",
		33 : "electric_bass_finger",
		34 : "electric_bass_pick",
		56 : "trumpet",
		61 : "brass_section",
		64 : "soprano_sax",*/
			65: "alto_sax",
			/*		66 : "tenor_sax",
		67 : "baritone_sax",
		73 : "flute",*/
			116: "taiko_drum"
		};
		return instruments;
	}

	PlayerModel_MidiCSL.prototype.getAllInstrumentsIndex = function() {
		var instruments = this.getAllInstruments();
		var instrumentsIndex = [];
		for (var instru in instruments) {
			instrumentsIndex.push(instru);
		}
		return instrumentsIndex;
	}

	PlayerModel_MidiCSL.prototype.getAllInstrumentsName = function() {
		var instruments = this.getAllInstruments();
		var instrumentsName = [];
		for (var instru in instruments) {
			instrumentsName.push(instruments[instru]);
		}
		return instrumentsName;
	}

	PlayerModel_MidiCSL.prototype.initMidiChannels = function(instruments) {
		if (typeof instruments === "undefined") {
			throw 'PlayerModel_MidiCSL - initMidiChannels - instruments must be defined';
		}
		var channels = {};
		if (typeof instruments !== "undefined") {
			for (var i = 0, c = instruments.length; i < c; i++) {
				channels[i] = {
					instrument: instruments[i],
					mute: false,
					mono: false,
					omni: false,
					solo: false
				};
			}
		}
		channels[9] = {
			instrument: 116,
			mute: false,
			mono: false,
			omni: false,
			solo: false
		};
		MIDI.channels = channels;
	}

	PlayerModel_MidiCSL.prototype.initMidiPlugin = function(instruments) {
		if (typeof instruments === "undefined") {
			throw 'PlayerModel_MidiCSL - initMidiPlugin - instruments must be defined';
		}
		var self = this;
		MIDI.loadPlugin({
			soundfontUrl: "/external-libs/Midijs/soundfont/",
			instruments: instruments,
			callback: self.MidiPluginIsReady.bind(self)
		});
	};

	PlayerModel_MidiCSL.prototype.MidiPluginIsReady = function() {
		this.setReady(true);
		$.publish('PlayerModel_MidiCSL-onload');
	};

	return PlayerModel_MidiCSL;
});