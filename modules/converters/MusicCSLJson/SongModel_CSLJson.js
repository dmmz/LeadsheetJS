define(['modules/core/SongModel', 'modules/core/SectionModel', 'modules/core/BarManager', 'modules/core/BarModel', 'modules/core/ChordManager', 'modules/core/ChordModel', 'modules/core/NoteManager', 'modules/core/NoteModel',
		'modules/converters/MusicCSLJson/SongModel_CSLJson', 'modules/converters/MusicCSLJson/SectionModel_CSLJson', 'modules/converters/MusicCSLJson/BarModel_CSLJson', 'modules/converters/MusicCSLJson/ChordManager_CSLJson', 'modules/converters/MusicCSLJson/ChordModel_CSLJson', 'modules/converters/MusicCSLJson/NoteManager_CSLJson', 'modules/converters/MusicCSLJson/NoteModel_CSLJson'
	],
	function(SongModel, SectionModel, BarManager, BarModel, ChordManager, ChordModel, NoteManager, NoteModel,
		SongModel_CSLJson, SectionModel_CSLJson, BarModel_CSLJson, ChordManager_CSLJson, ChordModel_CSLJson, NoteManager_CSLJson, NoteModel_CSLJson) {
		function SongModel_CSLJson() {};

		SongModel_CSLJson.prototype.importFromMusicCSLJSON = function(MusicCSLJSON, songModel, id) {
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
						sectionConverter = new SectionModel_CSLJson();
						sectionConverter.importFromMusicCSLJSON(JSONSection, section);
						songModel.addSection(section);

						if (JSONSection.bars != null) {
							JSONSection.bars.forEach(function(JSONBar) {
								bar = new BarModel();
								barConverter = new BarModel_CSLJson();
								barConverter.importFromMusicCSLJSON(JSONBar, bar);
								barManager.addBar(bar);
								if (JSONBar.chords != null) {
									JSONBar.chords.forEach(function(JSONChord) {
										chord = new ChordModel();
										chordConverter = new ChordModel_CSLJson();
										chordConverter.importFromMusicCSLJSON(JSONChord, chord);
										chord.setBarNumber(barNumber);
										chordManager.addChord(chord);
									});
								}
								if (JSONBar.melody != null) {
									existsMelody = true;
									JSONBar.melody.forEach(function(JSONNote) {
										note = new NoteModel();
										noteConverter = new NoteModel_CSLJson();
										noteConverter.importFromMusicCSLJSON(JSONNote, note);
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

		SongModel_CSLJson.prototype.exportToMusicCSLJSON = function(songModel) {
			if (!songModel instanceof SongModel) {
				throw 'SongModel_CSLJson - exportToMusicCSLJSON - songModel parameters must be an instanceof SongModel'
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
				var sectionConverter = new SectionModel_CSLJson();
				JSONSection = sectionConverter.exportToMusicCSLJSON(songModel.getSection(i));
				// bar information
				startBar = songModel.getStartBarNumberFromSectionNumber(i);
				lastBarSection = startBar + songModel.getSection(i).getNumberOfBars() - 1;

				var bars = [];
				var bar, chords, melody;

				for (var j = startBar; j <= lastBarSection; j++) {

					var barConverter = new BarModel_CSLJson();
					JSONBar = barConverter.exportToMusicCSLJSON(songModel.getBar(j));
					//bar = songModel.getBar(j).exportToMusicCSLJSON(songModel);

					chords = [];
					barChords = songModel.getComponentsAtBarNumber(j, 'chords');
					//jsLint complains but nevermind
					barChords.forEach(function(chord) {
						var chordConverter = new ChordModel_CSLJson();
						JSONChord = chordConverter.exportToMusicCSLJSON(chord);
						chords.push(JSONChord);
					});

					if (chords.length != 0)
						JSONBar.chords = chords;

					barNotes = songModel.getComponentsAtBarNumber(j, 'notes');

					melody = [];
					barNotes.forEach(function(note) {
						var noteConverter = new NoteModel_CSLJson();
						JSONNote = noteConverter.exportToMusicCSLJSON(note);
						melody.push(JSONNote);
					});

					if (melody.length != 0)
						JSONBar.melody = melody;

					bars.push(JSONBar);

				}

				JSONSection.bars = bars;
				MusicCSLJSON.changes[i] = JSONSection;
			}
			return MusicCSLJSON;
		};


		return SongModel_CSLJson;
	});