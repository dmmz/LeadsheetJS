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

//var NoteModel_MidiCSL = require('modules/MidiCSL/src/model/NoteModel_MidiCSL');


define(['jquery', 'modules/core/src/SongModel', 'modules/MidiCSL/src/converters/SongConverterMidi_MidiCSL', 'modules/MidiCSL/src/model/SongModel_MidiCSL', 'Midijs', 'pubsub'],
	function($, SongModel, SongConverterMidi_MidiCSL, SongModel_MidiCSL, MIDI, pubsub) {
		/* option contain
			editor				// Score Editor Object, it is use mainly for viewer to display cursor
			chordsInstrument
			melodyInstrument
			loop				// make the player loop over and over
			activeMetronome		// Boolean that indicates whether the metronome is active or not
			volume				// Float Main volume for all instruments it vary between 0 and 1
		*/
		function PlayerModel_MidiCSL(songModel, cursorModel, soundfontPath, option) {
			this.isReady = false; // boolean that indicates if player is ready to be played
			this.indexPosition = 0; // represent which notes have been lastly played
			this.playState = false; // playState indicate if the player is currently playing or not, (paused player will return false)
			this.songModel = songModel;
			this.isEnabled = true; //this is initialized on load
			this.tempo = songModel.getTempo();
			this.cursorModel = cursorModel;
			this.soundfontPath = soundfontPath;

			var initVolume;
			if ((typeof option !== "undefined" && typeof(option.volume) !== "undefined")) {
				// case that developper explicitly declared volume
				initVolume = option.volume;
			} else {
				// natural case (it use storage item to get last user volume)
				initVolume = this.initVolume(0.7);
			}


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
		}

		PlayerModel_MidiCSL.prototype.setSong = function(songModel) {
			if (typeof songModel === "undefined" || !(songModel instanceof SongModel)) {
				throw "PlayerModel_MidiCSL- setSong, song model shouldn't be empty and should be a SongModel instance" + songModel;
			}
			this.songModel = songModel;
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
		};

		PlayerModel_MidiCSL.prototype.setTempo = function(tempo) {
			if (!isNaN(tempo)) {
				this.tempo = tempo;
				this.songModel.setTempo(tempo);
			}
		};

		PlayerModel_MidiCSL.prototype.setReady = function(isReady) {
			if (typeof isReady !== "undefined") {
				this.isReady = isReady;
			}
		};

		PlayerModel_MidiCSL.prototype.getPlayState = function() {
			return this.playState;
		};

		PlayerModel_MidiCSL.prototype.doLoop = function() {
			return this.loop;
		};

		PlayerModel_MidiCSL.prototype.setLoop = function(loop) {
			if (typeof loop !== "undefined") {
				this.loop = !!loop;
				$.publish('PlayerModel-toggleLoop', loop);
				return true;
			} else {
				return false;
			}
		};

		PlayerModel_MidiCSL.prototype.toggleLoop = function(loop) {
			if (this.loop === true) {
				this.setLoop(false);
			} else {
				this.setLoop(true);
			}
			return this.loop;
		};

		PlayerModel_MidiCSL.prototype.mute = function() {
			this.chords.tmpVolume = this.getChordsVolume();
			this.melody.tmpVolume = this.getMelodyVolume();
			this.setVolume(0);
		};

		PlayerModel_MidiCSL.prototype.unmute = function() {
			this.setVolume(this.chords.tmpVolume);
		};

		PlayerModel_MidiCSL.prototype.doMetronome = function() {
			return this.activeMetronome;
		};

		PlayerModel_MidiCSL.prototype.muteMetronome = function() {
			this.activeMetronome = false;
			$.publish('PlayerModel-toggleMetronome', false);
		};

		PlayerModel_MidiCSL.prototype.unmuteMetronome = function() {
			this.activeMetronome = true;
			$.publish('PlayerModel-toggleMetronome', true);
		};

		PlayerModel_MidiCSL.prototype.initVolume = function(volume, force) {
			var oldVolume = localStorage.getItem("player-volume");
			if (oldVolume === null) {
				return volume;
			}
			return oldVolume;
		};

		PlayerModel_MidiCSL.prototype.setVolume = function(volume) {
			if (typeof volume === "undefined" || isNaN(volume)) {
				throw 'PlayerModel_MidiCSL - setVolume - volume must be a number ' + volume;
			}
			$.publish('PlayerModel-onvolumechange', volume);
			this.setMelodyVolume(volume);
			this.setChordsVolume(volume);
			localStorage.setItem("player-volume", volume);
		};

		PlayerModel_MidiCSL.prototype.getChordsVolume = function() {
			return this.chords.volume;
		};

		PlayerModel_MidiCSL.prototype.setChordsVolume = function(volume) {
			if (typeof volume === "undefined" || isNaN(volume)) {
				throw 'PlayerModel_MidiCSL - setChordsVolume - volume must be a number ' + volume;
			}
			/*MIDI.setVolume(1, volume * 127);*/
			this.chords.volume = volume;
		};

		PlayerModel_MidiCSL.prototype.getMelodyVolume = function() {
			return this.melody.volume;
		};

		PlayerModel_MidiCSL.prototype.setMelodyVolume = function(volume) {
			if (typeof volume === "undefined" || isNaN(volume)) {
				throw 'PlayerModel_MidiCSL - setMelodyVolume - volume must be a number ' + volume;
			}
			/*MIDI.setVolume(0, volume * 127);*/
			this.melody.volume = volume;
		};

		PlayerModel_MidiCSL.prototype.getChordsInstrument = function() {
			return this.chords.instrument;
		};

		PlayerModel_MidiCSL.prototype.setChordsInstrument = function(instrument) {
			if (typeof instrument !== "undefined") {
				this.chords.instrument = instrument;
				$.publish('PlayerModel-onChordsInstrument', instrument);
				return true;
			} else {
				return false;
			}
		};

		PlayerModel_MidiCSL.prototype.getMelodyInstrument = function() {
			return this.melody.instrument;
		};

		PlayerModel_MidiCSL.prototype.setMelodyInstrument = function(instrument) {
			if (typeof instrument !== "undefined") {
				this.melody.instrument = instrument;
				$.publish('PlayerModel-onMelodyInstrument', instrument);
				return true;
			} else {
				return false;
			}
		};

		PlayerModel_MidiCSL.prototype.getPositionIndex = function() {
			return this.indexPosition;
		};

		PlayerModel_MidiCSL.prototype.setPositionIndex = function(indexPosition, lastNote) {
			if (typeof indexPosition === "undefined" || isNaN(indexPosition)) {
				throw 'PlayerModel_MidiCSL - setPositionIndex - indexPosition must be a number ' + indexPosition;
			}
			this.indexPosition = indexPosition;
			// TODO, Index is not correct yet
			// this.cursorModel.setPos(indexPosition);
			// $.subscribe('CanvasLayer-refresh');
			// $.publish('ToViewer-draw', this.songModel);
		};

		/**
		 * Function set position between 0 and 1
		 * @param {int} between 0 and 1
		 */
		PlayerModel_MidiCSL.prototype.setPositionInPercent = function(positionInPercent) {
			if (typeof positionInPercent === "undefined" || isNaN(positionInPercent)) {
				throw 'PlayerModel_MidiCSL - setPositionInPercent - positionInPercent must be a float ' + positionInPercent;
			}
			this.positionInPercent = positionInPercent;
			$.publish('PlayerModel-onPosition', {
				'positionInPercent': positionInPercent,
				'songDuration': this.getSongDuration()
			});
		};

		/**
		 * Give position of player in the song
		 * @return {float} between 0 (not started) and 1 (finished)
		 */
		PlayerModel_MidiCSL.prototype.getPosition = function() {
			if (typeof this._startTime === "undefined" || isNaN(this._startTime) || typeof this.songDuration === "undefined" || isNaN(this.songDuration)) {
				throw 'PlayerModel_MidiCSL - getPosition - _startTime and songDuration must be numbers ' + this._startTime + ' ' + this.songDuration;
			}
			var position = (Date.now() - this._startTime) / this.songDuration;
			if (position > 1) {
				position = 1;
			}
			return position;
		};

		PlayerModel_MidiCSL.prototype.getSongDuration = function() {
			return this.songDuration ? this.songDuration : 0;
		};

		PlayerModel_MidiCSL.prototype.getBeatDuration = function(tempo) {
			if (typeof tempo === "undefined" || isNaN(tempo)) {
				throw 'PlayerModel_MidiCSL - getBeatDuration - tempo must be a number ' + tempo;
			}
			return 1000 * (60 / tempo);
		};

		/**
		 * Launch midi.noteon and noteoff instructions, this function is the main play function
		 * @param  {int} tempo in bpm, it influence how fast the song will be played
		 * @param  {float} playFrom is an optionnal attributes, if it's filled then player will start to play the note after playFrom, in sec
		 * @param  {float} playTo is an optionnal attributes, if it's filled then player will play until playTo in sec, otherwise it play til the end
		 */
		PlayerModel_MidiCSL.prototype.play = function(tempo, playFrom, playTo) {
			if (this.isEnabled === false) {
				return;
			}
			if (typeof tempo === "undefined" || isNaN(tempo)) {
				throw 'PlayerModel_MidiCSL - play - tempo must be a number ' + tempo;
			}
			this.emptyPlayNotes();
			var self = this;
			self.playState = true;
			$.publish('PlayerModel-onplay');
			// Convert songmodel to a readable model that we can insert in SongModel_MidiCSL
			SongConverterMidi_MidiCSL.exportToMidiCSL(this.songModel, function(midiSong) {
				var midiSongModel = new SongModel_MidiCSL({
					'song': midiSong
				});
				var metronome = midiSongModel.generateMetronome(self.songModel);
				midiSongModel.setFromType(metronome, 'metronome');
				var song = midiSongModel.getSong();
				if (song.length !== 0 && self.getReady() === true) {
					var lastNote = midiSongModel.getLastNote(); // Looking for last note
					var beatDuration = self.getBeatDuration(tempo);
					self.noteTimeOut = []; // Keep every setTimeout so we can clear them on pause/stop
					var beatOfLastNoteOff = lastNote.getCurrentTime() + lastNote.getDuration();
					var endTime = beatOfLastNoteOff * beatDuration + Date.now();
					self.songDuration = beatOfLastNoteOff * beatDuration;

					if (typeof playFrom === "undefined" || isNaN(playFrom)) {
						playFrom = song[self.indexPosition].getCurrentTime() * beatDuration;
					}
					self._startTime = Date.now() - playFrom;

					var velocityMin = 80;
					var randomVelocityRange = 40;

					var realIndex = 0;
					var metronomeChannel = self.instrumentsIndex.length - 1;

					var currentNote, currentMidiNote, duration, velocityNote, channel, volume;
					var playNote = false;
					// for each different position in the song
					for (var i = 0, c = song.length; i < c; i++) {
						currentNote = song[i];
						if (currentNote && (currentNote.getCurrentTime() * beatDuration) >= playFrom) {
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
										} else if (currentNote.getType() == "metronome" && self.doMetronome() === true) {
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
											self.setPositionInPercent((Date.now() - self._startTime) / self.songDuration);
										}
										/*}*/
										if (currentNote == lastNote || (currentNote.getCurrentTime() * self.getBeatDuration(tempo) >= playTo)) {
											self.setPositionIndex(i);
											self.setPositionInPercent(1);
											setTimeout((function() {
												self.setPositionIndex(0, beatOfLastNoteOff);
												self.setPositionInPercent(0);
												if (self.doLoop() === false) {
													console.log('ok');
													$.publish('PlayerModel-onfinish');
													self.stop();
												} else {
													$.publish('PlayerModel-onloopstart');
													self.play(tempo);
												}
											}), duration * 1000);
										}
									}, currentNote.getCurrentTime() * self.getBeatDuration(tempo) - playFrom);
								})(currentNote, realIndex, i, j);
								realIndex++;
							}
						}
					}
				}
			});
		};


		PlayerModel_MidiCSL.prototype.emptyPlayNotes = function() {
			if (typeof MIDI.stopAllNotes !== "undefined") {
				MIDI.stopAllNotes();
			}
			// melody and metronome
			for (var i in this.noteTimeOut) {
				window.clearTimeout(this.noteTimeOut[i]);
			}
		};

		PlayerModel_MidiCSL.prototype.pause = function() {
			this.playState = false;
			if (typeof MIDI.stopAllNotes !== "undefined") {
				MIDI.stopAllNotes();
			}
			// melody and metronome
			for (var i in this.noteTimeOut) {
				window.clearTimeout(this.noteTimeOut[i]);
			}
			$.publish('PlayerModel-onpause');
		};

		PlayerModel_MidiCSL.prototype.stop = function() {
			this.playState = false;
			if (typeof MIDI.stopAllNotes !== "undefined") {
				MIDI.stopAllNotes();
			}
			for (var i in this.noteTimeOut) {
				window.clearTimeout(this.noteTimeOut[i]);
			}
			this.setPositionIndex(0);
			this.setPositionInPercent(0);
			$.publish('PlayerModel-onstop');
		};

		PlayerModel_MidiCSL.prototype.enable = function() {
			this.isEnabled = true;
		};
		PlayerModel_MidiCSL.prototype.disable = function() {
			this.stop();
			this.isEnabled = false;
		};


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
				/*65: "alto_sax",*/
				/*		66 : "tenor_sax",
				67 : "baritone_sax",
				73 : "flute",*/
				116: "taiko_drum"
			};
			return instruments;
		};

		PlayerModel_MidiCSL.prototype.getAllInstrumentsIndex = function() {
			var instruments = this.getAllInstruments();
			var instrumentsIndex = [];
			for (var instru in instruments) {
				instrumentsIndex.push(instru);
			}
			return instrumentsIndex;
		};

		PlayerModel_MidiCSL.prototype.getAllInstrumentsName = function() {
			var instruments = this.getAllInstruments();
			var instrumentsName = [];
			for (var instru in instruments) {
				instrumentsName.push(instruments[instru]);
			}
			return instrumentsName;
		};

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
		};

		PlayerModel_MidiCSL.prototype.initMidiPlugin = function(instruments) {
			if (typeof instruments === "undefined") {
				throw 'PlayerModel_MidiCSL - initMidiPlugin - instruments must be defined';
			}
			var self = this;
			MIDI.loadPlugin({
				soundfontUrl: self.soundfontPath,
				instruments: instruments,
				callback: self.MidiPluginIsReady.bind(self)
			});
		};

		PlayerModel_MidiCSL.prototype.MidiPluginIsReady = function() {
			this.setReady(true);
			$.publish('PlayerModel-onload');
		};

		return PlayerModel_MidiCSL;
	});