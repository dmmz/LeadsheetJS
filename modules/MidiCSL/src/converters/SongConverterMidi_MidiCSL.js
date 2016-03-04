define([
		'modules/core/src/SongModel',
		'modules/MidiCSL/src/model/NoteModel_midiCSL',
		'modules/MidiCSL/src/converters/ChordManagerConverterMidi_MidiCSL',
		'modules/MidiCSL/utils/MidiHelper',
		'modules/core/src/NotesIterator',
		'modules/core/src/SongBarsIterator',
		'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
		'utils/AjaxUtils'
	],
	function(
		SongModel,
		NoteModel_midiCSL,
		ChordManagerConverterMidi_MidiCSL,
		MidiHelper,
		NotesIterator,
		SongBarsIterator,
		SongModel_CSLJson,
		AjaxUtils
	) {
		var SongConverterMidi_MidiCSL = {};
		/**
		 * SongConverterMidi_MidiCSL convert a song to a list of note that can be read by midi player
		 * It creates ChordConverterMidi_MidiCSL to retrieve midi informations about every chords and directly do the jobs for notes
		 * @exports MidiCSL/SongConverterMidi_MidiCSL
		 */
		SongConverterMidi_MidiCSL.exportToMidiCSL = function(songModel, unfold, callback) {
			if (!songModel instanceof SongModel) {
				throw 'SongConverterMidi_MidiCSL - exportToMusicCSLJSON - songModel parameters must be an instanceof SongModel';
			}
			
			function runExport(songModel, callback){
				song = SongConverterMidi_MidiCSL.exportElementsToMidiCSL(songModel);
					if (typeof callback !== "undefined") {
						callback(song);
					}
				return song;
			}
			var song = [];
			if (unfold === true) {
				this.unfold(songModel, function(newSongModel) {
					return runExport(newSongModel, callback);
				});
			} else {
				return runExport(songModel, callback);
			}
		};

		SongConverterMidi_MidiCSL.unfold = function(songModel, callback) {
			var self = this;
			var newSongModel;
			if (songModel.canBeUnfold() === true) { // replace by test if segno or code
				newSongModel = this.unfoldDirectly(songModel);
				if (typeof callback !== "undefined") {
					callback(newSongModel);
				}
				return newSongModel;
			} else {
				SongConverterMidi_MidiCSL.unfoldUsingServlet(songModel, function(newSongModel) {
					if (typeof newSongModel.error !== "undefined") {
						newSongModel = self.unfoldDirectly(songModel);
						return newSongModel;
					} else if (typeof callback !== "undefined") {
						callback(newSongModel);
					}
					return newSongModel;
				});
			}
		};

		SongConverterMidi_MidiCSL.unfoldDirectly = function(songModel) {
			var newSongModel = songModel.clone();
			newSongModel.unfold();
			return newSongModel;
		};

		SongConverterMidi_MidiCSL.unfoldUsingServlet = function(songModel, callback) {
			if (typeof callback === "undefined") {
				return;
			}
			var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(songModel);
			var request = {
				'leadsheet': JSON.stringify(JSONSong),
			};
			AjaxUtils.servletRequest('jsonsong', 'unfold', request, function(data) {
				if (typeof data.error !== "undefined") {
					callback(data);
					return;
				}
				var unfoldedSongModel = new SongModel();
				SongModel_CSLJson.importFromMusicCSLJSON(data.unfolded, unfoldedSongModel);
				callback(unfoldedSongModel);
				return;
			});
		};

		SongConverterMidi_MidiCSL.exportElementsToMidiCSL = function(songModel) {
			var song = [];
			song = ChordManagerConverterMidi_MidiCSL.exportToMidiCSL(songModel);
			var nm = songModel.getComponent('notes');
			if (typeof nm !== "undefined") {
				var melodySong = SongConverterMidi_MidiCSL.exportNotesToMidiCSL(songModel);
				song = song.concat(melodySong);
			}
			return song;
		};


		SongConverterMidi_MidiCSL.exportNotesToMidiCSL = function(songModel) {
			function addNote(midiNote, currentTime, duration, index, midiSong){
				midiSong.push(new NoteModel_midiCSL({
					midiNote: 	midiNote,
					type: 		'melody',
					currentTime:currentTime,
					duration: 	duration,
					noteIndex: 	index
				}));
			}

			var song = [];
			if (songModel === undefined || typeof MidiHelper === "undefined") {
				return song;
			}

			var note, duration, noteKey, midiNote,
				currentTime = 0,
				tieNotesObject = {},
				tieNotesNumber = 0,
				inTie = false,
				refreshTonalityNote = false,
				globalIndex = 0,
				midiSoundModel;

			var songIt = new SongBarsIterator(songModel);
			var noteMng = songModel.getComponent('notes');
			var playingNotes = noteMng.score2play(songModel);

			var notesIt = new NotesIterator(songIt, playingNotes);

			while (notesIt.hasNext()){
				note = playingNotes.getNote(notesIt.index);
				duration = note.getDuration();
				if (note.isRest) {
					addNote([false], currentTime, duration, globalIndex, song);
				} else {
					
					midiNote = [];
					for (var k = 0; k < note.getNumPitches(); k++) {
						midiNote[k] = MidiHelper.getKeyToNote(note.getPitch(k, true));
					}
					if (note.isTie() /*&& c !== 1*/) { // don't use tie when there is one note (it happen when we click on one note)
						if (note.getTie() === "start") {
							inTie = true;
							tieNotesNumber = 2;
							tieNotesObject = new NoteModel_midiCSL({
								'midiNote': midiNote,
								'type': 'melody',
								'currentTime': currentTime,
								'duration': duration,
								'noteIndex': globalIndex
							});
							addNote(false, currentTime, duration, globalIndex, song);
						}
						if (note.getTie() === "stop_start") {
							tieNotesNumber++;
							tieNotesObject.setDuration(tieNotesObject.getDuration() + duration);
							addNote(false, currentTime, duration, globalIndex, song);
						}
						if (note.getTie() === "stop") {
							
							inTie = false;
							if (typeof tieNotesObject.getDuration === "undefined") {
								// case the tieNotes have not been yet created (it's a particular case where tie note is tie with nothing)
								// It happens when we take a chunk of a melody
								tieNotesObject = new NoteModel_midiCSL({
									'midiNote': midiNote,
									'type': 'melody',
									'currentTime': currentTime,
									'duration': duration,
									'noteIndex': globalIndex
								});
							} else {
								// usual case
								tieNotesObject.setDuration(tieNotesObject.getDuration() + duration);
							}
							tieNotesObject.tieNotesNumber = tieNotesNumber;
							midiSoundModel = tieNotesObject;
							song.push(tieNotesObject);
							tieNotesNumber = 0;
						}
					} else {
						addNote(midiNote, currentTime, duration, globalIndex, song);
					}
				}
				currentTime += duration;
				globalIndex++;
				notesIt.next();
			}
			return song;
		};

		return SongConverterMidi_MidiCSL;
	});