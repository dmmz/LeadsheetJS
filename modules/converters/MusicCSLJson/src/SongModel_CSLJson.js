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
	var SongBarsIterator = require('modules/core/src/SongBarsIterator');
	var NoteUtils = require('utils/NoteUtils');

	var SongModel_CSLJson = {};

	SongModel_CSLJson.importFromMusicCSLJSON = function(MusicCSLJSON, songModel, id) {
		if (!songModel || !songModel instanceof SongModel) {
			songModel = new SongModel();
		} else {
			songModel.clear();
		}
		var chordManager = new ChordManager();
		var noteManager = new NoteManager();
		var barManager = new BarManager();

		//if (!MusicCSLJSON._id && !id)	throw "SongModel: importing from MusicCSL no id specified";

		if (!MusicCSLJSON) {
			throw "SongModel_CSLJson-importFromMusicCSLJSON: You can't import an empty song " + MusicCSLJSON;
		}

		//there are 4 cases: id by param, _id is 'MongoId' from php, _id is 'MongoId' from javascript or _id is string
		if (typeof MusicCSLJSON._id !== "undefined") {
			if (typeof MusicCSLJSON._id['$oid'] !== "undefined") {
				MusicCSLJSON._id['$id'] = MusicCSLJSON._id['$oid'];
			}
		}
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
			var barNumber = 0,
				onlyOneNote,
				wholeRestFound = false;
			if (MusicCSLJSON.changes != null) {
				MusicCSLJSON.changes.forEach(function(JSONSection) {
					section = new SectionModel();
					SectionModel_CSLJson.importFromMusicCSLJSON(JSONSection, section);
					songModel.addSection(section);

					if (JSONSection.bars != null) {
						JSONSection.bars.forEach(function(JSONBar) {
							bar = BarModel_CSLJson.importFromMusicCSLJSON(JSONBar, new BarModel());
							barManager.addBar(bar);
							//chords:
							if (JSONBar.chords != null) {
								JSONBar.chords.forEach(function(JSONChord) {
									chord = ChordModel_CSLJson.importFromMusicCSLJSON(JSONChord);
									chord.setBarNumber(barNumber);
									chordManager.addChord(chord);
								});
							}
							//melody;
							if (JSONBar.melody != null) {
								onlyOneNote = (JSONBar.melody.length === 1);
								JSONBar.melody.forEach(function(JSONNote) {
									note = new NoteModel();
									NoteModel_CSLJson.importFromMusicCSLJSON(JSONNote, note);
									noteManager.addNote(note);
								});
								if (onlyOneNote && note.isRest && note.duration === "w") {
									note.durationDependsOnBar = true; // if it's a whole rest, it will take bar's duration
									wholeRestFound = true;
								}
							}
							else{ //if no notes in bar, we add a whole rest
								note = new NoteModel();
								note.setNoteFromString("wr");
								noteManager.addNote(note);
								note.durationDependsOnBar = true; 
								wholeRestFound = true;
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
			//songModel.getUnfoldedSongStructure();
			if (wholeRestFound) { //if found bars with only one whole rest
				SongModel_CSLJson._updateNotesBarDuration(songModel);
			}
		}
		return songModel;
	};
	/**
	 * If there are bars with only one whole rest (very few cases), we set their real duration, which depends on the time signature bar
	 * @param  {SongModel} song 
	 */
	SongModel_CSLJson._updateNotesBarDuration = function(song) {
		/**
			function already defined in noteManager, it should be used in an 'utils' mod
		*/
		function roundBeat (beat) {
			return Math.round(beat * 1000000) / 1000000;
		}
		var songIt = new SongBarsIterator(song),
			notes = song.getComponent('notes').getNotes(),
			currentBarNumBeats = songIt.getBarTimeSignature().getQuarterBeats(),
			notesBarDur = 0;
		
		var i = 0;
		while (songIt.hasNext() && i < notes.length){
			
			
			// if it's first note, and duration depends on bar (only whole notes can have durationDependsOnBar = true)
			if (notesBarDur === 0 && notes[i].durationDependsOnBar){
				notes[i].barDuration = currentBarNumBeats;
			}

			notesBarDur += notes[i].getDuration();
			if (notesBarDur > currentBarNumBeats){
				console.warn("note exceeds bar duration (index "+ i +") bar "+songIt.getBarIndex());
			}
			else if (roundBeat(notesBarDur) == currentBarNumBeats ){
				notesBarDur = 0;
				songIt.next();	
				if (songIt.hasNext()){
					currentBarNumBeats = songIt.getBarTimeSignature().getQuarterBeats();	
				}
			}
			i++;
			
		}
		/*for (var i = 0; i < notes.length; i++) {
			// if it's first note, and duration depends on bar (only whole notes can have durationDependsOnBar = true)
			if (notesBarDur === 0 && notes[i].durationDependsOnBar){
				notes[i].barDuration = currentBarNumBeats;

			}
			notesBarDur += notes[i].getDuration();

			if (notesBarDur > currentBarNumBeats){
				console.warn("note exceeds bar duration (index "+ i +")");
			}
			else if (roundBeat(notesBarDur) == currentBarNumBeats ){
				notesBarDur = 0;
				
				if (songIt.next()){
					currentBarNumBeats = songIt.getBarTimeSignature().getQuarterBeats();
				}
			}
		}*/

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

		MusicCSLJSON.time = songModel.getTimeSignature().toString();

		MusicCSLJSON.keySignature = songModel.getTonality();
		MusicCSLJSON.tempo = songModel.getTempo();


		MusicCSLJSON.style = songModel.getStyle();
		MusicCSLJSON.source = songModel.getSource();

		// Sections
		var bm = songModel.getComponent("bars");
		var JSONSection = {};
		var startbarNumber, lastBarSection, barChords, barNotes;
		MusicCSLJSON.changes = [];
		for (var i = 0, c = songModel.getSections().length; i < c; i++) {
			// section information
			JSONSection = SectionModel_CSLJson.exportToMusicCSLJSON(songModel.getSection(i));
			// bar information
			startbarNumber = songModel.getStartBarNumberFromSectionNumber(i);
			lastBarSection = startbarNumber + songModel.getSection(i).getNumberOfBars() - 1;

			var bars = [];
			var bar, chords, melody;
			var JSONBar, JSONChord, JSONNote;

			for (var j = startbarNumber; j <= lastBarSection; j++) {
				JSONBar = BarModel_CSLJson.exportToMusicCSLJSON(bm.getBar(j));
				//bar = bm.getBar(j).exportToMusicCSLJSON(songModel);

				chords = [];
				barChords = songModel.getComponentsAtBarNumber(j, 'chords');
				//jsLint complains but nevermind
				barChords.forEach(function(chord) {
					JSONChord = ChordModel_CSLJson.exportToMusicCSLJSON(chord);
					chords.push(JSONChord);
				});

				if (chords.length != 0) JSONBar.chords = chords;

				barNotes = songModel.getComponentsAtBarNumber(j, 'notes');

				melody = [];
				barNotes.forEach(function(note) {
					JSONNote = NoteModel_CSLJson.exportToMusicCSLJSON(note);
					melody.push(JSONNote);
				});

				if (melody.length !== 0) JSONBar.melody = melody;

				bars.push(JSONBar);
			}

			JSONSection.bars = bars;
			MusicCSLJSON.changes[i] = JSONSection;
		}
		return MusicCSLJSON;
	};


	return SongModel_CSLJson;
});