define([
		"modules/core/src/SongModel",
		"modules/core/src/SectionModel",
		"modules/core/src/SectionBarsIterator",
		"modules/core/src/BarModel",
		"modules/core/src/BarManager",
		"modules/core/src/NoteManager",
		"modules/core/src/NoteModel",
		"modules/core/src/ChordManager",
		"modules/core/src/ChordModel",
		"modules/core/src/TimeSignatureModel",
		"modules/core/src/SongBarsIterator",
	],
	function(SongModel, SectionModel, SectionBarsIterator, BarModel, BarManager, NoteManager, NoteModel, ChordManager, ChordModel, TimeSignatureModel, SongBarsIterator ) {
		return {
			"SongModel": SongModel,
			"SectionModel": SectionModel,
			"SectionBarsIterator": SectionBarsIterator,
			"BarModel": BarModel,
			"BarManager": BarManager,
			"NoteManager": NoteManager,
			"NoteModel": NoteModel,
			"ChordManager": ChordManager,
			"ChordModel": ChordModel,
			"TimeSignatureModel": TimeSignatureModel,
			"SongBarsIterator": SongBarsIterator
		};
	}
);