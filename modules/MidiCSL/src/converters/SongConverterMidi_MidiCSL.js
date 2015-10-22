define([
		'modules/core/src/SongModel',
		'modules/MidiCSL/src/model/SongModel_midiCSL',
		'modules/MidiCSL/src/model/NoteModel_midiCSL',
		'modules/MidiCSL/src/converters/ChordManagerConverterMidi_MidiCSL',
		'modules/MidiCSL/utils/MidiHelper',
		'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
		'utils/AjaxUtils'
	],
	function(
		SongModel,
		SongModel_midiCSL,
		NoteModel_midiCSL,
		ChordManagerConverterMidi_MidiCSL,
		MidiHelper,
		SongModel_CSLJson,
		AjaxUtils
	) {
		var SongConverterMidi_MidiCSL = {};

		SongConverterMidi_MidiCSL.exportToMidiCSL = function(songModel, callback) {
			if (!songModel instanceof SongModel) {
				throw 'SongConverterMidi_MidiCSL - exportToMusicCSLJSON - songModel parameters must be an instanceof SongModel';
			}
			var song = [];
			var useServlet = false;
			if (useServlet === true) {
				SongConverterMidi_MidiCSL.unfoldUsingServlet(songModel, function(newSongModel) {
					song = SongConverterMidi_MidiCSL.exportElementsToMidiCSL(newSongModel);
					if (typeof callback !== "undefined") {
						callback(song);
					}
					return song;
				});
			} else {
				song = SongConverterMidi_MidiCSL.exportElementsToMidiCSL(songModel);
				if (typeof callback !== "undefined") {
					callback(song);
				}
				return song;
			}
		};

		SongConverterMidi_MidiCSL.unfoldUsingServlet = function(songModel, callback) {
			var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(songModel);
			var request = {
				'leadsheet': JSON.stringify(JSONSong),
			};
			AjaxUtils.servletRequest('jsonsong', 'unfold', request, function(data) {
				var unfoldedSongModel = new SongModel();
				SongModel_CSLJson.importFromMusicCSLJSON(data.unfolded, unfoldedSongModel);
				if (typeof callback !== "undefined") {
					callback(unfoldedSongModel);
				}
			});
		};

		SongConverterMidi_MidiCSL.exportElementsToMidiCSL = function(songModel) {
			var song = [];
			song = ChordManagerConverterMidi_MidiCSL.exportToMidiCSL(songModel);
			var nm = songModel.getComponent('notes');
			if (typeof nm !== "undefined") {
				var melodySong = SongConverterMidi_MidiCSL.exportNoteToMidiCSL(songModel);
				song = song.concat(melodySong);
			}
			return song;
		};


		SongConverterMidi_MidiCSL.exportNoteToMidiCSL = function(songModel) {
			var song = [];
			if (typeof songModel === "undefined" || typeof MidiHelper === "undefined") {
				return song;
			}
			var key = "C";
			var numBeats = 4;
			if (typeof songModel !== "undefined") {
				key = songModel.getTonality();
			}
			var tonalityNote = SongConverterMidi_MidiCSL.convertTonality2AlteredNote(key);
			var currentTime = 0;
			var note, duration, noteKey;
			var midiNote = [];
			var accidental = [];
			var tieNotesObject = {};
			var tieNotesNumber = 0;
			var inTie = false;
			var accidentalMeasure = (JSON.parse(JSON.stringify(tonalityNote))); // clone object
			var numMeasure = 0;
			var repeatMeasure = [];
			var refreshTonalityNote = false;

			var midiSoundModel, notesInBar, currentNote;


			// We could also use songModel.getUnfoldedSongComponents('notes'), in case of unfolded song structure doesnt work with numBars

			var barsIndex = songModel.getUnfoldedSongStructure();
			if (barsIndex.length === 0) {
				barsIndex[0] = 0; // in case there is no bars, use bar 0;
			}
			var globalIndex = 0;
			for (var i = 0, c = barsIndex.length; i < c; i++) {
				numMeasure = barsIndex[i];
				numBeats = songModel.getTimeSignatureAt(numMeasure).getBeats();
				notesInBar = songModel.getComponentsAtBarNumber(numMeasure, 'notes');
				if (inTie === false) {
					refreshTonalityNote = true;
					tonalityNote = SongConverterMidi_MidiCSL.convertTonality2AlteredNote(songModel.getTonalityAt(numMeasure));
					accidentalMeasure = (JSON.parse(JSON.stringify(tonalityNote))); // empty accidentalMeasure on each new measure
				} else { // case the last note is in tie, we don't refresh tonality
					refreshTonalityNote = false;
				}
				for (var j = 0, v = notesInBar.length; j < v; j++) {
					note = notesInBar[j];
					duration = note.getDuration(numBeats);
					if (note.isRest) {
						midiSoundModel = new NoteModel_midiCSL({
							'midiNote': [false],
							'type': 'melody',
							'currentTime': currentTime,
							'duration': duration,
							'noteIndex': globalIndex
						});
						song.push(midiSoundModel);
					} else {
						accidental = getAccidentalNoteKey(note, accidentalMeasure);
						noteKey = accidental[0];
						accidentalMeasure = accidental[1];
						midiNote = [];
						for (var k = 0; k < noteKey.length; k++) {
							midiNote[k] = MidiHelper.keyToNote[noteKey[k]];
						}
						if (note.isTie() && c !== 1) { // don't use tie when there is one note (it happen when we click on one note)
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
								midiSoundModel = new NoteModel_midiCSL({
									'midiNote': false,
									'type': 'melody',
									'currentTime': currentTime,
									'duration': duration,
									'noteIndex': globalIndex
								});
								song.push(midiSoundModel);
							}
							if (note.getTie() === "stop_start") {
								tieNotesNumber++;
								tieNotesObject.setDuration(tieNotesObject.getDuration(numBeats) + duration);
								midiSoundModel = new NoteModel_midiCSL({
									'midiNote': false,
									'type': 'melody',
									'currentTime': currentTime,
									'duration': duration,
									'noteIndex': globalIndex
								});
								song.push(midiSoundModel);
							}
							if (note.getTie() === "stop") {
								if (refreshTonalityNote === false) {
									refreshTonalityNote = true;
									tonalityNote = SongConverterMidi_MidiCSL.convertTonality2AlteredNote(songModel.getTonalityAt(numMeasure));
									accidentalMeasure = (JSON.parse(JSON.stringify(tonalityNote))); // empty accidentalMeasure on new measure
								}
								inTie = false;
								if (typeof tieNotesObject.getDuration === "undefined") {
									// case the tieNotes have not been yet created (it's a particular case where tie note is tie with nothing)
									// It happens when we take a chunk of a melody
									tieNotesObject = midiSoundModel = new NoteModel_midiCSL({
										'midiNote': midiNote,
										'type': 'melody',
										'currentTime': currentTime,
										'duration': duration,
										'noteIndex': globalIndex
									});
								} else {
									// usual case
									tieNotesObject.setDuration(tieNotesObject.getDuration(numBeats) + duration);
								}
								tieNotesObject.tieNotesNumber = tieNotesNumber;
								midiSoundModel = tieNotesObject;
								song.push(tieNotesObject);
								tieNotesNumber = 0;
							}
						} else {
							midiSoundModel = new NoteModel_midiCSL({
								'midiNote': midiNote,
								'type': 'melody',
								'currentTime': currentTime,
								'duration': duration,
								'noteIndex': globalIndex
							});
							song.push(midiSoundModel);
						}
					}
					currentTime += duration;
					globalIndex++;
				}
			}
			return song;

			function getAccidentalNoteKey(note) {
				if (typeof note === "undefined") {
					return;
				}
				var noteKey = [];
				var currentNoteKey;

				var accidental, pitchClass;
				for (var i = 0, c = note.getNumPitches(); i < c; i++) {
					accidental = note.getAccidental(i);
					pitchClass = note.getPitchClass(i);
					if (accidental === "n") {
						accidentalMeasure[pitchClass] = pitchClass;
					} else if (accidental === "#") {
						accidentalMeasure[pitchClass] = pitchClass + '#';
					} else if (accidental === "b") {
						accidentalMeasure[pitchClass] = pitchClass + 'b';
					} else if (accidental === "##") {
						accidentalMeasure[pitchClass] = pitchClass + '##';
					} else if (accidental === "bb") {
						accidentalMeasure[pitchClass] = pitchClass + 'bb';
					}

					currentNoteKey = accidentalMeasure[pitchClass] + note.getOctave(i);
					currentNoteKey = MidiHelper.convertDoubleAccidental(currentNoteKey);
					currentNoteKey = MidiHelper.convertSharp2Flat(currentNoteKey);
					currentNoteKey = MidiHelper.detectImpossibleFlat(currentNoteKey);
					noteKey[i] = currentNoteKey;
				}

				return [noteKey, accidentalMeasure];
			}


		};
		SongConverterMidi_MidiCSL.convertTonality2AlteredNote = function(key) {
			if (typeof key === "undefined") {
				return;
			}
			var alteredNote = {
				'A': 'A',
				'B': 'B',
				'C': 'C',
				'D': 'D',
				'E': 'E',
				'F': 'F',
				'G': 'G'
			};
			switch (key) {
				case "Cb":
					jQuery.extend(alteredNote, {
						'B': 'Bb',
						'E': 'Eb',
						'A': 'Ab',
						'D': 'Db',
						'G': 'Gb',
						'C': 'Cb',
						'F': 'Fb'
					});
					break;
				case "Gb":
					jQuery.extend(alteredNote, {
						'B': 'Bb',
						'E': 'Eb',
						'A': 'Ab',
						'D': 'Db',
						'G': 'Gb',
						'C': 'Cb'
					});
					break;
				case "Db":
					jQuery.extend(alteredNote, {
						'B': 'Bb',
						'E': 'Eb',
						'A': 'Ab',
						'D': 'Db',
						'G': 'Gb'
					});
					break;
				case "Ab":
					jQuery.extend(alteredNote, {
						'B': 'Bb',
						'E': 'Eb',
						'A': 'Ab',
						'D': 'Db'
					});
					break;
				case "Eb":
					jQuery.extend(alteredNote, {
						'B': 'Bb',
						'E': 'Eb',
						'A': 'Ab'
					});
					break;
				case "Bb":
					jQuery.extend(alteredNote, {
						'B': 'Bb',
						'E': 'Eb'
					});
					break;
				case "F":
					jQuery.extend(alteredNote, {
						'B': 'Bb'
					});
					break;
				case "C":
					// No alteration on C
					break;
				case "G":
					jQuery.extend(alteredNote, {
						'F': 'F#'
					});
					break;
				case "D":
					jQuery.extend(alteredNote, {
						'F': 'F#',
						'C': 'C#'
					});
					break;
				case "A":
					jQuery.extend(alteredNote, {
						'F': 'F#',
						'C': 'C#',
						'G': 'G#'
					});
					break;
				case "E":
					jQuery.extend(alteredNote, {
						'F': 'F#',
						'C': 'C#',
						'G': 'G#',
						'D': 'D#'
					});
					break;
				case "B":
					jQuery.extend(alteredNote, {
						'F': 'F#',
						'C': 'C#',
						'G': 'G#',
						'D': 'D#',
						'A': 'A#'
					});
					break;
				case "F#":
					jQuery.extend(alteredNote, {
						'F': 'F#',
						'C': 'C#',
						'G': 'G#',
						'D': 'D#',
						'A': 'A#',
						'E': 'E#'
					});
					break;
				case "C#":
					jQuery.extend(alteredNote, {
						'F': 'F#',
						'C': 'C#',
						'G': 'G#',
						'D': 'D#',
						'A': 'A#',
						'E': 'E#',
						'B': 'B#'
					});
					break;
			}
			return alteredNote;
		};
		return SongConverterMidi_MidiCSL;
	});