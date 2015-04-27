define([
		"modules/converters/MusicCSLJSON/src/BarModel_CSLJson",
		"modules/converters/MusicCSLJSON/src/ChordManager_CSLJson",
		"modules/converters/MusicCSLJSON/src/ChordModel_CSLJson",
		"modules/converters/MusicCSLJSON/src/NoteManager_CSLJson",
		"modules/converters/MusicCSLJSON/src/NoteModel_CSLJson",
		"modules/converters/MusicCSLJSON/src/SectionModel_CSLJson",
		"modules/converters/MusicCSLJSON/src/SongModel_CSLJson",
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