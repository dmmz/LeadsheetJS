define(['modules/core/src/SongModel', 'modules/core/src/ChordManager', 'modules/MidiCSL/src/converters/ChordConverterMidi_MidiCSL', 'modules/MidiCSL/src/model/NoteModel_midiCSL'],
	function(SongModel, ChordManager, ChordConverterMidi_MidiCSL, NoteModel_midiCSL) {
		/**
		 * ChordManagerConverterMidi_MidiCSL convert chords to a list of note that can be read by midi player
		 * It creates ChordConverterMidi_MidiCSL to retrieve midi informations about every chords
		 * Object is created by SongConverterMidi_MidiCSL
		 * @exports MidiCSL/ChordManagerConverterMidi_MidiCSL
		 */
		var ChordManagerConverterMidi_MidiCSL = {};

		ChordManagerConverterMidi_MidiCSL.exportToMidiCSL = function(songModel) {
			if (!songModel instanceof SongModel) {
				throw 'ChordManagerConverterMidi_MidiCSL - exportToMidiCSL - songModel parameters must be an instanceof SongModel';
			}

			var chords = [];
			if (songModel.getComponent('chords') === "undefined") {
				return undefined;
			}
			var chordManager = songModel.getComponent('chords');
			var currentTime = 0;
			var midiNotes = [];
			var duration = 0.0;
			var chordIndex;
			var chordsInBar = [];
			var numberOfChord = 0;
			var bars = songModel.getUnfoldedSongComponents('chords');
			// first we create midisoundmodel for each chord
			for (var barNum = 0, v = bars.length; barNum < v; barNum++) {
				chordsInBar = bars[barNum];
				if (chordsInBar.length === 0) {
					// case there is no chord in bar, we repeat previous one
					// if there is no previous, we do nothing
					if (chordIndex !== undefined){
						duration = chordManager.getChordDurationFromBarNumber(songModel, chordIndex, barNum) * songModel.timeSignature.getBeatUnitQuarter();
						var msm = new NoteModel_midiCSL({
							'currentTime': currentTime,
							'duration': duration,
							'midiNote': midiNotes,
							'type': 'chord'
						});
						currentTime += duration;
						chords.push(msm);

					}
				} else {
					for (var i = 0, c = chordsInBar.length; i < c; i++) {
						chordIndex = chordManager.getChordIndex(chordsInBar[i]);
						duration = chordManager.getChordDurationFromBarNumber(songModel, chordIndex, barNum) * songModel.timeSignature.getBeatUnitQuarter();
						midiNotes = ChordConverterMidi_MidiCSL.exportToMidiCSL(chordsInBar[i]);
						//console.log(chordsInBar[ i ], chordIndex, duration)
						var msm = new NoteModel_midiCSL({
							'currentTime': currentTime,
							'duration': duration,
							'midiNote': midiNotes,
							'type': 'chord'
						});
						currentTime += duration;
						chords.push(msm);
					}
				}
			}
			return chords;
		};

		return ChordManagerConverterMidi_MidiCSL;
	});