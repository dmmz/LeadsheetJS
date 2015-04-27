define([
		"modules/ChordEdition/src/main",
		"modules/chordSequence/src/SongView_chordSequence",
		"modules/Constraint/src/main",
		"modules/converters/MusicCSLJson/src/main",
		"modules/core/src/main", // most important module
		"modules/Cursor/src/main",
		"modules/FileEdition/src/main",
		"modules/History/src/main",
		"modules/HarmonicAnalysis/src/main",
		"modules/Harmonizer/src/main",
		"modules/LSViewer/src/main",
		"modules/MainMenu/src/main",
		"modules/NoteEdition/src/main",
		"modules/StructureEdition/src/main",
		"modules/Tag/src/main",
		"modules/WaveManager/src/main"
	],
	function(
		ChordEdition,
		chordSequence,
		Constraint,
		convertersMusicCSLJson,
		core,
		Cursor,
		FileEdition,
		History,
		HarmonicAnalysis,
		Harmonizer,
		LSViewer,
		MainMenu,
		NoteEdition,
		StructureEdition,
		Tag,
		WaveManager
	) {
		return {
			"ChordEdition": ChordEdition,
			"chordSequence": chordSequence,
			"Constraint": Constraint,
			"converters": {
				"MusicCSLJson": convertersMusicCSLJson,
			},
			"core": core,
			"Cursor": Cursor,
			"FileEdition": FileEdition,
			"History": History,
			"HarmonicAnalysis": HarmonicAnalysis,
			"Harmonizer": Harmonizer,
			"LSViewer": LSViewer,
			"MainMenu": MainMenu,
			"NoteEdition": NoteEdition,
			"StructureEdition": StructureEdition,
			"Tag": Tag,
			"WaveManager": WaveManager,
		};
	}
);