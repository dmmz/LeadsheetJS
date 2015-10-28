define(['modules/core/src/ChordModel'], function(ChordModel) {
	var ChordModel_MusicXML = {};

	ChordModel_MusicXML.importFromMusicXML = function(MusicXMLChord) {
		var chord = new ChordModel();

		if (MusicXMLChord.hasOwnProperty('chordPitch')) {
			chord.setNote(MusicXMLChord.chordPitch);
		}
		if (MusicXMLChord.hasOwnProperty('chordType')) {
			chord.setChordType(MusicXMLChord.chordType);
		}

		return chord;
	};

	return ChordModel_MusicXML;
});