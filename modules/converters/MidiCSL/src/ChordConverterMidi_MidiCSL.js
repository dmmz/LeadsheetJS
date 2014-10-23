define(['modules/core/src/SongModel', 'modules/core/src/ChordManager', 'modules/core/src/ChordModel', 'modules/MidiCSLModel/src/NoteModel_midiCSLModel', 'utils/NoteUtils', 'utils/ChordUtils', 'modules/converters/MidiCSL/utils/MidiHelper'],
	function(SongModel, ChordManager, ChordModel, NoteModel_midiCSLModel, NoteUtils, ChordUtils, MidiHelper) {

		var ChordConverterMidi_MidiCSL = {};

		ChordConverterMidi_MidiCSL.exportToMidiCSL = function(chordModel, callback) {
			if (!chordModel instanceof ChordModel) {
				throw 'ChordConverterMidi_MidiCSL - exportToMidiCSL - chordModel parameters must be an instanceof SongModel';
			}
			var midiNotes = ChordConverterMidi_MidiCSL.getAllMidiNotes(chordModel);
			return midiNotes;
		}

		ChordConverterMidi_MidiCSL.getAllMidiNotes = function(chordModel, callback) {
			// case notes and midinotes are unknown
			var chordTypesNotes = ChordConverterMidi_MidiCSL.getChordTypesNotes(chordModel);
			if (typeof chordTypesNotes !== "undefined") {
				// case chordTypeNotes in C are known
				var midiNotes = MidiHelper.convertNotesToMidi(chordTypesNotes);
				var decal = NoteUtils.pitch2Number(chordModel.getNote());
				var allMidiNotes = MidiHelper.transposeMidiNotes(midiNotes, decal);
				return allMidiNotes;
			}
		};

		ChordConverterMidi_MidiCSL.getChordTypesNotes = function(chordModel) {
			var note = chordModel.getNote();
			if (note === "NC") {
				chordModel.allMidiNotes = [];
				if (typeof callback !== "undefined") {
					callback([]);
				}
				return;
			}
			var chordType = chordModel.unformatChordType(chordModel.getChordType());
			var chordTypeToNote = ChordUtils.getAllChords();
			/**
			 * We first try to know if chordModel chord is already known
			 */
			if (typeof chordTypeToNote !== "undefined" && typeof chordTypeToNote[chordType] !== "undefined") {
				var chordNotes = chordTypeToNote[chordType];
				return chordNotes;
			}
			console.warn('ChordConverterMidi_MidiCSL: Unknown chord ' + chordModel.toString());
			return [];
		}


		ChordConverterMidi_MidiCSL.convertNotesToMidi = function(chordModel) {
			chordModel.allMidiNotes = MidiHelper.convertNotesToMidi(chordModel.allNotes);
			return chordModel.allMidiNotes;
		};
		return ChordConverterMidi_MidiCSL;

	});