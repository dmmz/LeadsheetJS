define([
		"modules/converters/MusicXML/src/BarModel_MusicXML",
		"modules/converters/MusicXML/src/ChordModel_MusicXML",
		"modules/converters/MusicXML/src/NoteModel_MusicXML",
		"modules/converters/MusicXML/src/SongModel_MusicXML"
	],
	function(BarModel_MusicXML, ChordModel_MusicXML, NoteModel_MusicXML, SongModel_MusicXML) {
		return {
			"BarModel_MusicXML": BarModel_MusicXML,
			"ChordModel_MusicXML": ChordModel_MusicXML,
			"NoteModel_MusicXML": NoteModel_MusicXML,
			"SongModel_MusicXML": SongModel_MusicXML
		};
	}
);