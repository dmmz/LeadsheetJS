define(['modules/core/SongModel', 'modules/core/SectionModel', 'modules/core/BarManager', 'modules/core/BarModel', 'modules/core/ChordManager', 'modules/core/ChordModel', 'modules/core/NoteManager', 'modules/core/NoteModel'],
	function(SongModel, SectionModel, BarManager, BarModel, ChordManager, ChordModel, NoteManager, NoteModel) {
		function SongModel_CSLJson(MusicCSLJSON) {

		};

		SongModel_CSLJson.prototype.musicCSLJson2SongModel = function(MusicCSLJSON, id) {
			var self = songModel;
			var chordManager = new ChordManager({
				songModel: songModel
			});
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
						section.musicCSLJson2SongModel(JSONSection);
						self.addSection(section);

						if (JSONSection.bars != null) {
							JSONSection.bars.forEach(function(JSONBar) {
								bar = new BarModel();
								bar.musicCSLJson2SongModel(JSONBar);
								barManager.addBar(bar);
								if (JSONBar.chords != null) {
									JSONBar.chords.forEach(function(JSONChord) {
										chord = new ChordModel();
										chord.musicCSLJson2SongModel(JSONChord);
										chord.setBarNumber(barNumber);
										chordManager.addChord(chord);
									});
								}
								if (JSONBar.melody != null) {
									existsMelody = true;
									JSONBar.melody.forEach(function(JSONNote) {
										noteManager.addNote(new NoteModel(JSONNote));
									});
								}
								barNumber++;
							});
						} else {
							console.log(JSONSection.bars);
						}


					});
					songModel.addComponent('bars', barManager);
					noteManager.setNotesBarNum(self);
					songModel.addComponent('chords', chordManager);
					songModel.addComponent('notes', noteManager);
				}
			}
			//songModel.getUnfoldedSongStructure();
		};

		SongModel_CSLJson.prototype.songModel2MusicCSLJson = function(songModel) {
			console.log(songModel);
			if (!songModel instanceof SongModel) {
				throw 'SongModel_CSLJson - songModel2MusicCSLJson - songModel parameters must be an instanceof SongModel'
			}

			var MusicCSLJSON = {};
			MusicCSLJSON._id = songModel._id;
			MusicCSLJSON.title = songModel.getTitle();
			var composer = songModel.getComposer();
			if(typeof composer !== "undefined"){
				composer = composer.toString();
			}
			MusicCSLJSON.composer = composer;

			MusicCSLJSON.time = songModel.getTimeSignature();
			MusicCSLJSON.keySignature = songModel.getTonality();
			MusicCSLJSON.tempo = songModel.getTempo();


			MusicCSLJSON.style = songModel.getStyle();
			MusicCSLJSON.source = songModel.getSource();

			// Sections
			var section = {};
			var startbarNumber, barNumber, currentBar;
			MusicCSLJSON.changes = [];
			for (var i = 0, c = songModel.getSections().length; i < c; i++) {
				// section information
				section = songModel.getSection(i).songModel2MusicCSLJson(songModel);

				// bar information
				startBar = songModel.getStartBarNumberFromSectionNumber(i);
				lastBarSection = startBar + songModel.getSection(i).getNumberOfBars() - 1;

				var bars = [];
				var bar, chords, melody;

				for (var j = startBar; j <= lastBarSection; j++) {

					bar = songModel.getBar(j).songModel2MusicCSLJson(songModel);

					chords = [];
					barChords = songModel.getComponentsAtBarNumber(j, 'chords');
					//jsLint complains but nevermind
					barChords.forEach(function(chord) {
						chords.push(chord.songModel2MusicCSLJson(songModel));
					});

					if (chords.length != 0)
						bar.chords = chords;

					barNotes = songModel.getComponentsAtBarNumber(j, 'notes');

					melody = [];
					barNotes.forEach(function(note) {
						melody.push(note.songModel2MusicCSLJson(songModel));
					});

					if (melody.length != 0)
						bar.melody = melody;

					bars.push(bar);

				}

				section.bars = bars;
				MusicCSLJSON.changes[i] = section;
			}
			return MusicCSLJSON;
		};


		return SongModel_CSLJson;
	});