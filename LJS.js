define([
		"modules/ChordEdition/src/ChordEdition",
		"modules/chordSequence/src/SongView_chordSequence",
		"modules/Constraint/src/Constraint",
		"modules/converters/MusicCSLJson/src/main",
		"modules/converters/MusicXML/src/main",
		"modules/core/src/main", // most important module
		"modules/Cursor/src/Cursor",
		"modules/FileEdition/src/FileEdition",
		"modules/History/src/HistoryC",
		"modules/HarmonicAnalysis/src/HarmonicAnalysis",
		"modules/Harmonizer/src/Harmonizer",
		"modules/LSViewer/src/main",
		"modules/MainMenu/src/MainMenu",
		"modules/MidiCSL/src/main",
		"modules/NoteEdition/src/NoteEdition",
		"modules/StructureEdition/src/StructureEdition",
		"modules/Tag/src/main",
		"modules/WaveManager/src/main",
		"utils/main"
	],
	function(
		ChordEdition,
		chordSequence,
		Constraint,
		convertersMusicCSLJson,
		convertersMusicXML,
		core,
		Cursor,
		FileEdition,
		HistoryC,
		HarmonicAnalysis,
		Harmonizer,
		LSViewer,
		MainMenu,
		MidiCSL,
		NoteEdition,
		StructureEdition,
		Tag,
		WaveManager,
		utils
	) {
		return {
			"ChordEdition": ChordEdition,
			"chordSequence": chordSequence,
			"Constraint": Constraint,
			"converters": {
				"MusicCSLJson": convertersMusicCSLJson,
				"MusicXML": convertersMusicXML
			},
			"core": core,
			"Cursor": Cursor,
			"FileEdition": FileEdition,
			"HistoryC": HistoryC,
			"HarmonicAnalysis": HarmonicAnalysis,
			"Harmonizer": Harmonizer,
			"LSViewer": LSViewer,
			"MainMenu": MainMenu,
			"MidiCSL": MidiCSL,
			"NoteEdition": NoteEdition,
			"StructureEdition": StructureEdition,
			"Tag": Tag,
			"WaveManager": WaveManager,
			"utils": utils
		};
	}
);