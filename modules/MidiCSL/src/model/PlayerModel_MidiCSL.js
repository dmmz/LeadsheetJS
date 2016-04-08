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


define([
		'jquery',
		'modules/core/src/SongModel',
		'modules/core/src/NoteModel',
		'modules/MidiCSL/src/converters/SongConverterMidi_MidiCSL',
		'modules/MidiCSL/src/model/SongModel_MidiCSL',
		'Midijs',
		'pubsub'
	],
	function($,
		SongModel,
		NoteModel,
		SongConverterMidi_MidiCSL,
		SongModel_MidiCSL,
		MIDI,
		pubsub) {
		
		/**
		 * PlayerModel_MidiCSL is the main midi player class, it creates and reads a SongModel_MidiCSL object from a SongModel
		 * @exports MidiCSL/PlayerModel_MidiCSL
		 * @param {SongModel} songModel     Songmodel that will be read by the midi player
		 * @param {String} soundfontPath url to sond fount
		 * @param {Object} option        contain
			chordsInstrument
			melodyInstrument
			loop				// make the player loop over and over
			activeMetronome		// Boolean that indicates whether the metronome is active or not
			volume				// Float Main volume for all instruments it vary between 0 and 1
		*/
		function PlayerModel_MidiCSL(songModel, soundfontPath, options) {
			options = options || {};
			this.isReady = false; // boolean that indicates if player is ready to be played
			this.indexPosition = 0; // represent which notes have been lastly played
			this.playState = false; // playState indicate if the player is currently playing or not, (paused player will return false)
			this.songModel = songModel;
			this.isEnabled = true; //this is initialized on load
			if (songModel) {
				this.tempo = songModel.getTempo();
			}
			this.soundfontPath = soundfontPath;

			var initVolume;
			if (options.volume !== undefined) {
				// case that developper explicitly declared volume
				initVolume = options.volume;
			} else {
				// natural case (it use storage item to get last user volume)
				initVolume = this.initVolume(0.7);
			}
			this.cursorModel = options.cursorModel;
			this.cursorNoteModel = options.cursorNoteModel;
			
			this.chords = {
				volume: initVolume,
				tmpVolume: initVolume,
				instrument: (typeof options.chordsInstrument !== "undefined") ? options.chordsInstrument : 0,
			};
			this.melody = {
				volume: initVolume,
				tmpVolume: initVolume,
				instrument: (typeof options.melodyInstrument !== "undefined") ? options.melodyInstrument : 0,
			};
			this.activeMetronome = !!options.activeMetronome;
			// When loop attributes is set to true, player will restart after the last note (indefinitively)
			this.loop = !!options.loop;

			this.autoload = (typeof options.autoload !== "undefined") ? options.autoload : true;
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
			if (!this.isEnabled){
				return;
			}
			if (typeof loop !== "undefined") {
				this.loop = !!loop;
				$.publish('PlayerModel-toggleLoop', loop);
				return true;
			} else {
				return false;
			}
		};

		PlayerModel_MidiCSL.prototype.toggleLoop = function() {
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

		PlayerModel_MidiCSL.prototype.setPositionIndex = function(indexPosition) {
			if (typeof indexPosition === "undefined") {
				throw 'PlayerModel_MidiCSL - setPositionIndex - indexPosition must be defined ' + indexPosition;
			}
			this.indexPosition = indexPosition;
			this.cursorModel.setPos(indexPosition);
			$.publish('CanvasLayer-refresh');
		};



		/**
		 * Function set position between 0 and 1
		 * @param {int} between 0 and 1
		 */
		PlayerModel_MidiCSL.prototype.setPositionInPercent = function(positionInPercent) {
			this.positionInPercent = positionInPercent;
			$.publish('PlayerModel-positionPerCent', {
				positionInPercent: positionInPercent,
				songDuration: this.getSongDuration()
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
			if (this.isEnabled === false || this.getReady() === false) {
				return;
			}
			if (typeof tempo === "undefined" || isNaN(tempo)) {
				throw 'PlayerModel_MidiCSL - play - tempo must be a number ' + tempo;
			}
			this.emptyPlayNotes();
			var self = this;
			this.playState = true;
			$.publish('PlayerModel-onplay');
			// Convert songmodel to a readable model that we can insert in SongModel_MidiCSL
			SongConverterMidi_MidiCSL.exportToMidiCSL(this.songModel, true, function(midiSong) {
				var midiSongModel = new SongModel_MidiCSL({
					'song': midiSong
				});
				var metronome = midiSongModel.generateMetronome(self.songModel);
				midiSongModel.setFromType(metronome, 'metronome');
				var song = midiSongModel.getSong();
				if (song.length !== 0) {
					var lastNote = midiSongModel.getLastNote(); // Looking for last note
					var beatDuration = self.getBeatDuration(tempo);
					self.noteTimeOut = []; // Keep every setTimeout so we can clear them on pause/stop
					var beatOfLastNoteOff = lastNote.getCurrentTime() + lastNote.getDuration();
					var endTime = beatOfLastNoteOff * beatDuration + Date.now();
					self.songDuration = beatOfLastNoteOff * beatDuration;
					if (playFrom === undefined || isNaN(playFrom)) {
						var cursorPosition = self.cursorNoteModel ? self.cursorNoteModel.getPos() : [null];
						
						if (cursorPosition[0] == null) cursorPosition = [0, 0];
						playFrom = 0;
						// should check here if cursor is enabled
						if (cursorPosition[0] !== 0) {
							if (typeof midiSongModel.getMelodySoundModelFromIndex(cursorPosition[0]) !== "undefined") {
								playFrom = midiSongModel.getMelodySoundModelFromIndex(cursorPosition[0]).getCurrentTime() * beatDuration;
							} else {
								// case of tie notes
								playFrom = midiSongModel.getMelodySoundModelFromIndex(cursorPosition[0] - 1).getCurrentTime() * beatDuration;
							}
						}
						if (cursorPosition.length !== 1 && cursorPosition[1] !== cursorPosition[0]) {
							if (typeof midiSongModel.getMelodySoundModelFromIndex(cursorPosition[1]) !== "undefined") {
								playTo = midiSongModel.getMelodySoundModelFromIndex(cursorPosition[1]).getCurrentTime() * beatDuration;
							} else {
								// case of tie notes
								playTo = midiSongModel.getMelodySoundModelFromIndex(cursorPosition[1] - 1).getCurrentTime() * beatDuration;
							}
						}
					}

					self._startTime = Date.now() - playFrom;

					var velocityMin = 80;
					var randomVelocityRange = 40;

					var realIndex = 0;
					var metronomeChannel = 9;

					// for each different position in the song
					for (var i = 0, c = song.length; i < c; i++) {
						var currentNote = song[i];
						if (currentNote && (currentNote.getCurrentTime() * beatDuration) >= playFrom) {
							// for each notes on a position (polyphonic song will have j > 1)
							for (var j = 0, v = currentNote.getMidiNote().length; j < v; j++) {
								// Use let instead of var when ES6 will be supported across browser
								(function(currentNote, realIndex, i, j) {
									self.noteTimeOut[realIndex] = setTimeout(function() {
										var currentMidiNote, duration, velocityNote, channel, volume;
										var playNote = false;
										if (currentNote.getMidiNote() === "undefined") {
											return;
										}
										currentMidiNote = currentNote.getMidiNote()[j];
										if (currentMidiNote === false) {} // Silence
										else {
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
												MIDI.noteOff(channel, currentMidiNote, currentNote.getDuration() * (60 / tempo));
											}
										}
										if (currentNote.getType() == "melody") {
											if (typeof currentNote.tieNotesNumber !== "undefined" && currentNote.tieNotesNumber) {
												self.setPositionIndex([currentNote.getNoteIndex(), currentNote.getNoteIndex() + currentNote.tieNotesNumber - 1]);
											} else {
												self.setPositionIndex(currentNote.getNoteIndex());
											}
											self.setPositionInPercent((Date.now() - self._startTime) / self.songDuration);
										}
										if (currentNote == lastNote || (currentNote.getCurrentTime() * self.getBeatDuration(tempo) >= playTo)) {
											//self.setPositionInPercent(1);
											if (self.doLoop() !== false) {
												self.stop(); // TODO stop on setTimeout Else make it buggy
											}
											setTimeout((function() {
												if (self.doLoop() === false) {
													self.stop();
													self.setPositionIndex(0);
													self.setPositionInPercent(0);
													$.publish('PlayerModel-onfinish');
												} else {
													self.play(tempo, playFrom, playTo);
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
					if (instruments[i] != "116") {
						channels[i] = {
							instrument: parseInt(instruments[i], 10),
							number: parseInt(instruments[i], 10),
							program: parseInt(instruments[i], 10),
							mute: false,
							mono: false,
							omni: false,
							solo: false
						};
					}
				}
			}
			channels[9] = {
				instrument: 116,
				number: 116,
				program: 116,
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
				onsuccess: self.MidiPluginIsReady.bind(self)
			});
		};

		PlayerModel_MidiCSL.prototype.MidiPluginIsReady = function() {
			this.setReady(true);
			$.publish('PlayerModel-onload', 'midi');
		};

		return PlayerModel_MidiCSL;
	});