define(function(require) {

	var SongModel = require('modules/core/src/SongModel');
	var SectionModel = require('modules/core/src/SectionModel');
	var BarManager = require('modules/core/src/BarManager');
	var BarModel = require('modules/core/src/BarModel');
	var ChordManager = require('modules/core/src/ChordManager');
	var ChordModel = require('modules/core/src/ChordModel');
	var NoteManager = require('modules/core/src/NoteManager');
	var NoteModel = require('modules/core/src/NoteModel');
	var SectionModel_CSLJson = require('modules/converters/MusicCSLJson/src/SectionModel_CSLJson');
	var BarModel_CSLJson = require('modules/converters/MusicCSLJson/src/BarModel_CSLJson');
	var ChordManager_CSLJson = require('modules/converters/MusicCSLJson/src/ChordManager_CSLJson');
	var ChordModel_CSLJson = require('modules/converters/MusicCSLJson/src/ChordModel_CSLJson');
	var NoteManager_CSLJson = require('modules/converters/MusicCSLJson/src/NoteManager_CSLJson');
	var NoteModel_CSLJson = require('modules/converters/MusicCSLJson/src/NoteModel_CSLJson');

	var SongModel_CSLJson = {};

	SongModel_CSLJson.importFromMusicCSLJSON = function(MusicCSLJSON, songModel, id) {
		var chordManager = new ChordManager();
		var noteManager = new NoteManager();
		var barManager = new BarManager();

		//if (!MusicCSLJSON._id && !id)	throw "SongModel: importing from MusicCSL no id specified";

		//there are 3 cases: id by param, _id is 'MongoId' or _id is string
		songModel._id = (MusicCSLJSON._id) ? MusicCSLJSON._id['$id'] : id;
		if (!songModel._id)
			songModel._id = MusicCSLJSON._id;

		if (typeof MusicCSLJSON !== "undefined") {

			songModel.setTitle(MusicCSLJSON.title);
			songModel.setTimeSignature(MusicCSLJSON.time);
			songModel.setTonality(MusicCSLJSON.keySignature);
			songModel.addComposer(MusicCSLJSON.composer);
			songModel.setStyle(MusicCSLJSON.style);
			songModel.setSource(MusicCSLJSON.source);
			songModel.setTempo(MusicCSLJSON.tempo);

			var section, chord, note, bar;
			var existsMelody = false;
			var barNumber = 0;
			if (MusicCSLJSON.changes != null) {
				MusicCSLJSON.changes.forEach(function(JSONSection) {
					section = new SectionModel();
					SectionModel_CSLJson.importFromMusicCSLJSON(JSONSection, section);
					songModel.addSection(section);

					if (JSONSection.bars != null) {
						JSONSection.bars.forEach(function(JSONBar) {
							bar = BarModel_CSLJson.importFromMusicCSLJSON(JSONBar, new BarModel());
							barManager.addBar(bar);
							if (JSONBar.chords != null) {
								JSONBar.chords.forEach(function(JSONChord) {
									chord = new ChordModel();
									ChordModel_CSLJson.importFromMusicCSLJSON(JSONChord, chord);
									chord.setBarNumber(barNumber);
									chordManager.addChord(chord);
								});
							}
							if (JSONBar.melody != null) {
								existsMelody = true;
								JSONBar.melody.forEach(function(JSONNote) {
									note = new NoteModel();
									NoteModel_CSLJson.importFromMusicCSLJSON(JSONNote, note);
									noteManager.addNote(note);
								});
							}
							barNumber++;
						});
					} else {
						console.log(JSONSection.bars);
					}


				});
				songModel.addComponent('bars', barManager);
				//noteManager.setNotesBarNum(songModel);
				songModel.addComponent('chords', chordManager);
				songModel.addComponent('notes', noteManager);
			}
		}
		//songModel.getUnfoldedSongStructure();
		return songModel;
	};

	SongModel_CSLJson.exportToMusicCSLJSON = function(songModel) {
		if (!songModel instanceof SongModel) {
			throw 'SongModel_CSLJson - exportToMusicCSLJSON - songModel parameters must be an instanceof SongModel';
		}

		var MusicCSLJSON = {};
		if (typeof songModel._id !== "undefined") {
			MusicCSLJSON._id = songModel._id;
		}
		var composer = songModel.getComposer();
		if (typeof composer !== "undefined") {
			composer = composer.toString();
		}
		MusicCSLJSON.composer = composer;
		MusicCSLJSON.title = songModel.getTitle();

		MusicCSLJSON.time = songModel.getTimeSignature();

		MusicCSLJSON.keySignature = songModel.getTonality();
		MusicCSLJSON.tempo = songModel.getTempo();


		MusicCSLJSON.style = songModel.getStyle();
		MusicCSLJSON.source = songModel.getSource();

		// Sections
		var JSONSection = {};
		var startbarNumber, barNumber, currentBar;
		MusicCSLJSON.changes = [];
		for (var i = 0, c = songModel.getSections().length; i < c; i++) {
			// section information
			JSONSection = SectionModel_CSLJson.exportToMusicCSLJSON(songModel.getSection(i));
			// bar information
			startBar = songModel.getStartBarNumberFromSectionNumber(i);
			lastBarSection = startBar + songModel.getSection(i).getNumberOfBars() - 1;

			var bars = [];
			var bar, chords, melody;

			for (var j = startBar; j <= lastBarSection; j++) {
				JSONBar = BarModel_CSLJson.exportToMusicCSLJSON(songModel.getBar(j));
				//bar = songModel.getBar(j).exportToMusicCSLJSON(songModel);

				chords = [];
				barChords = songModel.getComponentsAtBarNumber(j, 'chords');
				//jsLint complains but nevermind
				barChords.forEach(function(chord) {
					JSONChord = ChordModel_CSLJson.exportToMusicCSLJSON(chord);
					chords.push(JSONChord);
				});

				if (chords.length != 0)		JSONBar.chords = chords;

				barNotes = songModel.getComponentsAtBarNumber(j, 'notes');

				melody = [];
				barNotes.forEach(function(note) {
					JSONNote = NoteModel_CSLJson.exportToMusicCSLJSON(note);
					melody.push(JSONNote);
				});

				if (melody.length !== 0)		JSONBar.melody = melody;

				bars.push(JSONBar);
			}

			JSONSection.bars = bars;
			MusicCSLJSON.changes[i] = JSONSection;
		}
		return MusicCSLJSON;
	};


	return SongModel_CSLJson;
});