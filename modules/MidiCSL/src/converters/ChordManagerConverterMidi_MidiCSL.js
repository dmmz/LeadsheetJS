define([
	'modules/core/src/SongModel', 
	'modules/core/src/ChordManager', 
	'modules/MidiCSL/src/converters/ChordConverterMidi_MidiCSL', 
	'modules/MidiCSL/src/model/NoteModel_midiCSL'
	],
	function(SongModel, ChordManager, ChordConverterMidi_MidiCSL, NoteModel_midiCSL, SongBarsIterator) {
		/**
		 * ChordManagerConverterMidi_MidiCSL convert chords to a list of note that can be read by midi player
		 * It creates ChordConverterMidi_MidiCSL to retrieve midi informations about every chords
		 * 
		 * Object is created by SongConverterMidi_MidiCSL
		 * @exports MidiCSL/ChordManagerConverterMidi_MidiCSL
		 */
		var ChordManagerConverterMidi_MidiCSL = {};

		/**
		 * gets MidiCSL notes for a SongModel. Concretely it works this way:
		 * for each bar takes the chords and translates it to Midi, so that notes are played at the precise time
		 * if a bar has no chord:
		 *  	- if there is no previous chord, it does nothing
		 *  	- if there is a previous chord, it repeats that previous chord
		 * 
		 * TODO: could be more easily done with SongIterator, but we do not have the unfolded version of the songIterator, so we use this function
		 * @param  {SongModel} songModel 
		 * @return {Array} of Objects representing midi notes for chords
		 * 
		 */
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
					
					if (chordIndex === undefined){
						//if there was no previous chord we just update currentTime
						currentTime += songModel.getTimeSignatureAt(barNum).getBeats();
					}
					else{
						// case there is no chord in bar, we repeat previous one
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
					//if there are we add them to the chords array 
					for (var i = 0, c = chordsInBar.length; i < c; i++) {
						chordIndex = chordManager.getChordIndex(chordsInBar[i]);
						duration = chordManager.getChordDurationFromBarNumber(songModel, chordIndex, barNum) * songModel.timeSignature.getBeatUnitQuarter();
						midiNotes = ChordConverterMidi_MidiCSL.exportToMidiCSL(chordsInBar[i]);
						//if first bar chord is not in first beat, we update currentTime, adding the difference between 'chord duration in bar' (var duration) and 'total bar duration'
						if (i === 0 && chordsInBar[0].beat != 1 ){
							currentTime += songModel.getTimeSignatureAt(barNum).getBeats() - duration;
						}
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