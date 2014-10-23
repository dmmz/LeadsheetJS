define(['modules/core/src/SongModel', 'modules/core/src/ChordManager', 'modules/converters/MidiCSL/src/ChordConverterMidi_MidiCSL', 'modules/MidiCSLModel/src/NoteModel_midiCSLModel'],
	function(SongModel, ChordManager, ChordConverterMidi_MidiCSL, NoteModel_midiCSLModel) {
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
				for (var i = 0, c = chordsInBar.length; i < c; i++) {
					numberOfChord++;
					chordIndex = chordManager.getChordIndex(chordsInBar[i]);
					duration = chordManager.getChordDuration(songModel, chordIndex);
					midiNotes = ChordConverterMidi_MidiCSL.exportToMidiCSL(chordsInBar[i]);
					//console.log(chordsInBar[ i ], chordIndex, duration)
					var msm = new NoteModel_midiCSLModel({
						'currentTime': currentTime,
						'duration': duration,
						'midiNote': midiNotes,
						'type': 'chord'
					});
					currentTime += duration;
					chords.push(msm);
				}
			}
			return chords;
		};

		return ChordManagerConverterMidi_MidiCSL;
	});