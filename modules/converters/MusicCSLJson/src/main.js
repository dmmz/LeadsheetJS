define([
		"modules/converters/MusicCSLJson/src/BarModel_CSLJson",
		"modules/converters/MusicCSLJson/src/ChordManager_CSLJson",
		"modules/converters/MusicCSLJson/src/ChordModel_CSLJson",
		"modules/converters/MusicCSLJson/src/NoteManager_CSLJson",
		"modules/converters/MusicCSLJson/src/NoteModel_CSLJson",
		"modules/converters/MusicCSLJson/src/SectionModel_CSLJson",
		"modules/converters/MusicCSLJson/src/SongModel_CSLJson",
	],
	function(BarModel_CSLJson, ChordManager_CSLJson, ChordModel_CSLJson, NoteManager_CSLJson, NoteModel_CSLJson, SectionModel_CSLJson, SongModel_CSLJson) {
		return {
			"BarModel_CSLJson": BarModel_CSLJson,
			"ChordManager_CSLJson": ChordManager_CSLJson,
			"ChordModel_CSLJson": ChordModel_CSLJson,
			"NoteManager_CSLJson": NoteManager_CSLJson,
			"NoteModel_CSLJson": NoteModel_CSLJson,
			"SectionModel_CSLJson": SectionModel_CSLJson,
			"SongModel_CSLJson": SongModel_CSLJson
		};
	}
);