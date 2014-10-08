var NoteManagerModel = function() {
	this.notes = [];
};

//Interface functions (this functions are also in ChordManagerModel  )

/**
 * @interface
 * @return {integer}
 */
NoteManagerModel.prototype.getTotalNotes = function() {
	return this.notes.length;
};

/**
 * @interface
 * @param  {integer} start
 * @param  {integer} end
 * @return {Array}
 */

NoteManagerModel.prototype.getBeatIntervalByIndexes = function(start, end) {
	var startBeat = this.getNoteBeat(start);
	var endBeat = this.getNoteBeat(end) + this.getNote(end).getDuration();
	return [startBeat, endBeat];
};
/**
 * @interface
 *
 * @param  {integer} from index of first note to get
 * @param  {integer} to   index of last note to get
 * @return {Array}      array of NoteModel
 */
/*NoteManagerModel.prototype.getElemsToMusicCSLJSON = function(from, to) {
	var notes = [];
	this.getNotes(from, to + 1).forEach(function(note) {
		notes.push(note.exportToMusicCSLJSON());
	});
	return notes;
};*/

/**
 * @interface
 *
 * returns a copy of the notes from, pos1, to pos2.
 * @param  {Integer} pos1
 * @param  {Integer} pos2
 * @param  {String} type : if "model" returns notes as copies of NoteMode Prototype, if "struct" it returns it in 'struct' fromat
 * @return {[type]}      [description]
 */
/*NoteManagerModel.prototype.clone = function(pos1, pos2, type) {
	type = type || "model";
	var newNotes = [];
	var note;
	var notesToClone = this.getNotes(pos1, pos2);

	notesToClone.forEach(function(note) {
		var cNote;
		if (type == "struct")
			cNote = note.toNoteStruct();
		else
			cNote = note.clone();

		newNotes.push(cNote);
	});

	return newNotes;
};*/



NoteManagerModel.prototype.insertNote = function(note, pos) {
	if (!note instanceof NoteModel) throw "note is not an instance of Note";
	pos = pos || 0;
	this.notes.splice(pos + 1, 0, note);
};

NoteManagerModel.prototype.getNote = function(pos) {
	return this.notes[pos];
};

/**
 * gets notes (by reference. To clone use cloneElems)
 * @param  {Integer} from :  index, if not specified, 0
 * @param  {Integer} to   :  index, first note that is not taken, e.g if to = 4, notes will be taken from 'from' to 3.
 * @return {Array}   array of NoteModel
 */
NoteManagerModel.prototype.getNotes = function(from, to) {
	return this.notes.slice(from, to);
};

NoteManagerModel.prototype.setNotes = function(notes) {
	if (typeof notes !== "undefined") {
		this.notes = notes;
		return true;
	}
	return false;
};

NoteManagerModel.prototype.incrOffset = function(offset, dur) {
	offset += dur;
	var roundOffset = Math.round(offset);
	if (Math.abs(roundOffset - offset) < 0.01) offset = roundOffset; //0.01 to round only for 0.99999
	return offset;
};

NoteManagerModel.prototype.getNoteIndex = function( note ) {
	if(typeof note !== "undefined" && note instanceof NoteModel){
		for (var i = 0; i < this.notes.length; i++) {
			if(JSON.stringify(this.notes[i].toNoteStruct(true, true)) === JSON.stringify(note.toNoteStruct(true, true))) {
				return i;
			}
		}
	}
	return undefined;
};

NoteManagerModel.prototype.setNotesBarNum = function(songModel, pos) {
	function isSameMeasure(offset, offsetAnt, nMeasureBeats, beatsPerBar, timeSig, songModel) {
		var tu = songModel.getBeatUnitFromTimeSignature(timeSig);

		offset -= nMeasureBeats;
		offsetAnt -= nMeasureBeats;
		var mOffset = offset / (beatsPerBar * tu);
		var mOffsetAnt = offsetAnt / (beatsPerBar * tu);

		var isSameMeasure = (Math.floor(Math.round((mOffset) * 100) / 100) == Math.floor(Math.round((mOffsetAnt) * 100) / 100));
		var error = (!isSameMeasure && mOffset > 1);
		//first round to 2 decimals (to aviod issues with triplets (periodics 0.3333333), then floor to see if they are in the same beat ) 
		return {
			v: isSameMeasure,
			error: error
		};
	}

	pos = pos || 0;
	var barNumber = 0;
	var beatsPerBar = songModel.getBeatsFromTimeSignatureAt(barNumber);
	var localTimeSig = songModel.getTimeSignatureAt(barNumber);
	var nMeasureBeatsAcc = 0; //offset in beats on absolute bars
	var nMeasureBeats = beatsPerBar * songModel.getBeatUnitFromTimeSignature(localTimeSig);
	var offset = 0,
		offsetAnt = 0;


	for (var i = pos; i < this.getTotal(); i++) {
		note = this.notes[i];

		// isSameMeasure=songModel.isSameMeasure(offset,offsetAnt,nMeasureBeatsAcc,beatsPerBar,localTimeSig);
		var sameMeasure = isSameMeasure(offset, offsetAnt, nMeasureBeatsAcc, beatsPerBar, localTimeSig, songModel);

		if (!sameMeasure.v) { //will not enter the first time

			barNumber++;
			nMeasureBeats = beatsPerBar * songModel.getBeatUnitFromTimeSignature(localTimeSig);
			nMeasureBeatsAcc += nMeasureBeats;
			localTimeSig = songModel.getTimeSignatureAt(barNumber);
			beatsPerBar = songModel.getBeatsFromTimeSignatureAt(barNumber);

		}
		note.setMeasure(barNumber);
		offsetAnt = offset;
		offset = this.incrOffset(offset, note.getDuration(nMeasureBeats));
	}

};

NoteManagerModel.prototype.getNotesStruct = function(complete, withNumMeasure) {
	var notesStruct = [];
	for (var i in this.notes) {
		notesStruct.push(this.notes[i].toNoteStruct(complete, withNumMeasure));
	}
	return notesStruct;

};


NoteManagerModel.prototype.deleteNote = function(cursor) {
	var notes = this.getNotes();

	var marginNotesToRevise = 3;
	var numNotesToDelete = cursor[1] - cursor[0] + 1;
	this.notes.splice(cursor[0], numNotesToDelete);
	this.reviseNotes(cursor[0] - marginNotesToRevise, cursor[1] + marginNotesToRevise);

};


/**
 * replace notes from pos1 to pos2+1, by default will always replace one note, if we want to insert notes at 
 * position pos without replacing note at 'pos' (e.g. scoreeditor.addBar() does it) we need to call it with 
 * cursor = [pos, pos -1 ]
 * @param  {Array} cursor       [pos1,pos2]
 * @param  {Array } notesToPaste array of NoteModel
 
 */
NoteManagerModel.prototype.notesSplice = function(cursor, notesToPaste) {

	var part1 = this.notes.slice(0, cursor[0]);
	var part2 = this.notes.slice(cursor[1] + 1, this.notes.length); //selected notes are removed
	var copyArr = [];
	for (var i = 0; i < notesToPaste.length; i++) copyArr.push(notesToPaste[i].clone());
	this.notes = part1.concat(copyArr, part2);
	//	this.reviseNotes();
};


/**
 * returns duration in number of beats
 * @param  {Integer} pos1
 * @param  {Integer} pos2
 * @return {float}
 */
NoteManagerModel.prototype.getTotalDuration = function(pos1, pos2) {
	var notes = this.getNotes(pos1, pos2);
	var totalDur = 0;
	notes.forEach(function(note) {
		totalDur += note.getDuration();
	});
	return totalDur;
};

/**
 * if a duration function applied to a tuplet note, we expand cursor to include the other tuplet notes (to avoid strange durations)
 * 
 * @param  {CursorModel} cursor 
 * @return {cursorModel} updated cursor
 */
NoteManagerModel.prototype.reviseTuplets = function(cursor) {
	var notes= this.getNotes();
	var c = cursor.getStart();
	if (notes[c].isTuplet())
	{
		c--;
		while( c >= 0 && notes[c].isTuplet() && !notes[c].isTuplet('stop')){
			cursor.setPos([c,cursor.getEnd()]);
			c --;
		}
	}
	c = cursor.getEnd();
	if (notes[c].isTuplet())
	{
		c++;
		while( c < notes.length && notes[c].isTuplet() && !notes[c].isTuplet('start')){
			cursor.setPos([cursor.getStart(),c]);	
			c ++;
		}
	}
	return cursor;
};

/**
 * this function is called after deleting a notes or copy and pasting notes, to check if there is a malformed tuplet or a malformed tie
 * if it does, it deletes the tie or the tuplet
 * @return {[type]} [description]
 */
NoteManagerModel.prototype.reviseNotes = function(from, to) {

	checkTuplets(this.notes);
	checkTies(this.notes);


	function getRemoveSet(input, i) {
		var min = i;
		var max = i;
		while (min > 0 && input[min - 1] != "no") {
			min--;
		}
		while (max + 1 < input.length && input[max + 1] != "no") {
			max++;
		}
		return {
			min: min,
			max: max
		};
	}

	/**
	 * This function parses input controling that all transitions are valid,
	 * if it finds a problem, removes the property that causes the error
	 *
	 * @param  {Array of NoteModel} notes          notes to modify
	 * @param  {Object} graph          tranistion graph represents valid transitions
	 * @param  {Array}  input          array of states, taken from notes
	 * @param  {[type]} removeFunction function to remove property
	 */
	function parser(notes, graph, input, removeFunction) {
		var prevState, currState;
		var isTie = [];
		var states = Object.keys(graph);
		var iToStartRemoving;
		var intervalsToRemove = [];
		for (var i = 0; i < input.length; i++) {
			prevState = (i < 1) ? "no" : input[i - 1];
			currState = (i == input.length) ? "no" : input[i];

			if ($.inArray(prevState, states) == -1) {
				throw "value " + prevState + "(position " + i + ") not specified on transitions graph";
			}
			if ($.inArray(currState, graph[prevState]) == -1) {

				iToStartRemove = (currState == "no") ? i - 1 : i;
				intervalsToRemove.push(getRemoveSet(input, iToStartRemove));
			}
		};

		var max, min;
		for (var i in intervalsToRemove) {
			max = intervalsToRemove[i].max;
			min = intervalsToRemove[i].min;

			for (var j = min; j <= max; j++) {
				NoteModel.prototype[removeFunction].call(notes[j], notes[j].tie);
			}
		}

	}

	function checkTuplets(notes) {
		var note;
		var states = [];
		var state;
		for (var i = 0; i < notes.length; i++) {
			note = notes[i];
			state = note.getTuplet() || "no";
			states.push(state);
		}
		parser(notes, {
				"no": ["no", "start"],
				"start": ["middle"],
				"middle": ["stop"],
				"stop": ["start", "no"]
			}, states,
			"removeTuplet"
		);
	}

	function checkTies(notes) {
		var note;
		var states = [];
		var state;
		for (var i = 0; i < notes.length; i++) {
			note = notes[i];
			state = note.getTie() || "no";
			states.push(state);
		}
		parser(notes, {
				"no": ["no", "start"],
				"start": ["stop", "stop_start"],
				"stop_start": ["stop", "stop_start"],
				"stop": ["start", "no"]
			}, states,
			"removeTie"
		);

	}
};
/**
 * if there are ties that with different pitches, we remove the tie
 * @return {[type]} [description]
 */
NoteManagerModel.prototype.reviseTiesPitch = function() {
	var notes = this.notes;	
	var note,notes2;
	for (var i = 0; i < notes.length-1; i++){
		note = notes[i];
		note2 = notes[i+1];
		if (note.isTie('start') && note2.isTie('stop') && note.getPitch()!= note2.getPitch())
		{
			note.removeTie(note.getTie());
			note2.removeTie(note2.getTie());
		}
	}
};

NoteManagerModel.prototype.setPositions = function(notesDraw, marginLeft, staves, cursorMarginLeft, cursorHeight, marginCursor) {
	var notes = this.getNotes();
	for (var i in notes) {
		notes[i].setPosition(notesDraw[i], marginLeft, staves, cursorMarginLeft, cursorHeight, marginCursor);
	};

};
NoteManagerModel.prototype.findMinMaxNotesByCoords = function(coords) {
	var note, min = null,
		max = null;

	for (var i in this.notes) {
		note = this.notes[i];
		if (note.isInPath(coords)) {
			if (min == null) min = Number(i);
			if (max == null || max < i) max = Number(i);
		}
	}
	return [min, max];

};

NoteManagerModel.prototype.printNotes = function() {
	var notes = this.getNotes();
	for (var i = 0; i < notes.length; i++) {
		console.log(notes[i].toString());
	}
};

/**
 * gets an array of notes and updates, it's used only on harmonizer
 * @param  {Array} notes
 * @return {NoteManagerModel}   returns itself after importing notes
 */
NoteManagerModel.prototype.importFromMusicCSLJSON = function(notes, song) {
	if (typeof notes !== "undefined") {
		for (var i in notes) {
			this.addNote(new NoteModel(notes[i]));
		}
	}
	this.setNotesBarNum(song);
	return this;
};

/**
 * This function returns beat in a number of bar of a given note
 */
NoteManagerModel.prototype.getNoteBeat = function(index) {
	if (typeof index === "undefined" || isNaN(index))
		return -1;
	var noteBeat = 0;

	for (var i = 0; i < index; i++) {
		noteBeat += this.notes[i].getDuration();
	}
	return Math.round(noteBeat * 1000000) / 1000000 + 1; // +1 because beats are based on 1
};



NoteManagerModel.prototype.getNotesByBarNumber = function(barNumber) {
	var notesByBarNumber = [];
	if (typeof barNumber !== "undefined" && !isNaN(barNumber)) {
		var currentNote;
		for (var i = 0, c = this.getNotes().length; i < c; i++) {
			currentNote = this.getNote(i);
			if (currentNote.getMeasure() === barNumber) {
				notesByBarNumber.push(currentNote);
			}
		}
	}
	return notesByBarNumber;
}

/**
 * returns the global beat of a note specified by its index (starting at 1)
 * @param  {Integer} index of the note
 * @return {Float}   beat
 */
NoteManagerModel.prototype.getGlobalNoteBeat = function(index) {
	var beat = 1;
	for (var i = 0; i < index; i++) {
		beat += this.getNote(i).getDuration();
	}
	return beat;
};

/**
 * Returns the index found at the exact beat, and if not, at the
 * closest note just after a given beat
 * @param  {float} beat global beat (first beat starts at 1, not 0)
 * @return {Integer} index of the note
 */
NoteManagerModel.prototype.getNextIndexNote = function(beat) {
	var curBeat = 1;
	var i = 0;
	//we round to avoid problems with triplet as 12.9999999 is less than 13 and that would not work
	//we round in the comparison in order to not carry the rounding in curBeat (which is cumulative inside the iteration)
	while (Math.round(curBeat*100000)/100000 < beat) { //to avoid problems with tuplet 
		curBeat += this.getNote(i).getDuration();
		i++;
	}
	return i;
};


/**
 * Similar to previous one (getNextIndexNote()), but if
 * exact beat is not found, it returns the closest previous note
 * @param  {float} beat global beat (first beat starts at 1, not 0)
 * @return {Integer} index of the note
 */
NoteManagerModel.prototype.getPrevIndexNote = function(beat) {
	var curBeat = 1;
	var i = 0;
	//round just like in getNtextIndexNote
	while (Math.round(curBeat * 1000000) / 1000000 < beat) { 
		
		curBeat += this.getNote(i).getDuration();
		i++;
	}
	return i - 1;
};

NoteManagerModel.prototype.getIndexesByBeatInterval = function(startBeat, endBeat) {
	var index1 = this.getNextIndexNote(startBeat);
	var index2 = this.getPrevIndexNote(endBeat);

	return [index1, index2];
};
/**
 * adds silences at the end of array of notes so that they fill the gapDuration
 * @param  {integer} gapDuration 
 */
NoteManagerModel.prototype.fillGapWithRests = function(gapDuration) {
	gapDuration = Math.round(gapDuration * 1000000) / 1000000;

	var newNote;
	var silenceDurs = NoteTools.durationToNotes(gapDuration);
	var self = this;
	silenceDurs.forEach(function(dur) {
		if (typeof dur !== "undefined") {
			newNote = new NoteModel();
			newNote.createRestNote(dur);
			self.addNote(newNote);
		}
	});
};

NoteManagerModel.prototype.click = function(editor, coords) {
	var minMax = this.findMinMaxNotesByCoords(coords);
	if (minMax[0] != null && minMax[1] != null && minMax[0] == minMax[1]) {
		this.play(minMax);
	}
}

NoteManagerModel.prototype.play = function(minMax) {
	if (typeof minMax !== "undefined") {
		if (minMax[0] != null && minMax[1] != null && minMax[0] == minMax[1]) {
			this.getNote(minMax[0]).playNote();
		}
	}
};

define ('CSLJSON', function(leadsheeteditor, MusicCSLJSON) {

	CSLJSON.prototype.importFromMusicCSLJSON = function(CSLJSON) {	

		var self = this;
		var songModel = new SongModel();
		var chordManager = new ChordManagerModel({
			songModel: this
		});
		var noteManager = new NoteManagerModel();
		var barManager = new BarManagerModel();

		//if (!MusicCSLJSON._id && !id)	throw "SongModel: importing from MusicCSL no id specified";
		
		//there are 3 cases: id by param, _id is 'MongoId' or _id is string
		songModel._id=(MusicCSLJSON._id) ? MusicCSLJSON._id['$id'] : id;
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
			var existsMelody=false;
			var barNumber = 0;
			if (MusicCSLJSON.changes != null) {
				MusicCSLJSON.changes.forEach(function(JSONSection) {

					section = new SectionModel();
					section.importFromMusicCSLJSON(JSONSection);
					self.addSection(section);

					if (JSONSection.bars!=null){
						JSONSection.bars.forEach(function(JSONBar) {
							bar = new BarModel();
							bar.importFromMusicCSLJSON(JSONBar);
							barManager.addBar(bar);
							if (JSONBar.chords != null) {
								JSONBar.chords.forEach(function(JSONChord) {
									chord = new ChordModel();
									chord.importFromMusicCSLJSON(JSONChord);
									chord.setBarNumber(barNumber);
									chordManager.addChord(chord);
								});
							}
							if (JSONBar.melody != null) {
								existsMelody=true;
								JSONBar.melody.forEach(function(JSONNote) {
									noteManager.addNote(new NoteModel(JSONNote));
								});
							}
							barNumber++;
						});					
					}else{
						console.log(JSONSection.bars);
					}
					

				});
				songModel.addComponent('bars', barManager);
				noteManager.setNotesBarNum(self); 
				songModel.addComponent('chords', chordManager);
				songModel.addComponent('notes', noteManager);
				


			}
		}
	}
/*	CSLJSON.prototype.importNoteFromMusicCSLJSON = function(CSLJSON) {	
		for(note in CSLJSON){
			var newNote = new NoteModel();
			this.nm.addNote(newNote);
		}
	}
	CSLJSON.prototype.importchordFromMusicCSLJSON = function(CSLJSON) {	
		for(note in CSLJSON){
			var newNote = new NoteModel();
			this.nm.addNote(newNote);
		}	mai
	}*/
}


NoteManagerModel.prototype.getMidiNotes4Player = function(songModel) {
	var key = "C";
	var numBeats = 4;
	if (typeof songModel !== "undefined") {
		key = songModel.getTonality();
	}
	var tonalityNote = convertTonality2AlteredNote(key);
	var currentTime = 0;
	var note, duration, noteKey;
	var song = [];
	var midiNote = [];
	var accidental = [];
	var tieNotesObject = {};
	var tieNotesNumber = 0;
	var inTie = false;
	var accidentalMeasure = (JSON.parse(JSON.stringify(tonalityNote))); // clone object
	var numMeasure = 0;
	var repeatMeasure = [];
	var refreshTonalityNote = false;


	var midiSoundModel, notesInBar, currentNote;

	var barsIndex = songModel.getUnfoldedSongStructure();
	if (barsIndex.length === 0) {
		barsIndex[0] = 0; // in case there is no bars, use bar 0;
	}
	for (var i = 0, c = barsIndex.length; i < c; i++) {
		numMeasure = barsIndex[i];
		numBeats = songModel.getBeatsFromTimeSignatureAt(numMeasure);
		notesInBar = songModel.getComponentsAtBarNumber(numMeasure, 'notes');
		if (inTie === false) {
			refreshTonalityNote = true;
			tonalityNote = convertTonality2AlteredNote(songModel.getTonalityAt(numMeasure));
			accidentalMeasure = (JSON.parse(JSON.stringify(tonalityNote))); // empty accidentalMeasure on each new measure
		} else { // case the last note is in tie, we don't refresh tonality
			refreshTonalityNote = false;
		}
		for (var j = 0; j < notesInBar.length; j++) {
			note = notesInBar[j];
			duration = note.getDuration(numBeats);
			if (note.isRest) {
				midiSoundModel = new MidiSoundModel({
					'midiNote': [false],
					'type': 'melody',
					'currentTime': currentTime,
					'duration': duration,
					'noteModel': note
				});
				song.push(midiSoundModel);
			} else {
				accidental = getAccidentalNoteKey(note, accidentalMeasure);
				noteKey = accidental[0];
				accidentalMeasure = accidental[1];
				midiNote = [];
				for (var k = 0; k < noteKey.length; k++) {
					midiNote[k] = MIDI.keyToNote[noteKey[k]];
				}

				if (note.isTie() && c !== 1) { // don't use tie when there is one note (it happen when we click on one note)
					if (note.getTie() === "start") {
						inTie = true;
						tieNotesNumber = 1;
						tieNotesObject = new MidiSoundModel({
							'midiNote': midiNote,
							'type': 'melody',
							'currentTime': currentTime,
							'duration': duration,
							'noteModel': note
						});
						midiSoundModel = new MidiSoundModel({
							'midiNote': false,
							'type': 'melody',
							'currentTime': currentTime,
							'duration': duration,
							'noteModel': note
						});
						song.push(midiSoundModel);
					}
					if (note.getTie() === "stop_start") {
						tieNotesNumber++;
						tieNotesObject.setDuration(tieNotesObject.getDuration(numBeats) + duration);
						midiSoundModel = new MidiSoundModel({
							'midiNote': false,
							'type': 'melody',
							'currentTime': currentTime,
							'duration': duration,
							'noteModel': note
						});
						song.push(midiSoundModel);
					}
					if (note.getTie() === "stop") {
						if (refreshTonalityNote === false) {
							refreshTonalityNote = true;
							tonalityNote = convertTonality2AlteredNote(songModel.getTonalityAt(numMeasure));
							accidentalMeasure = (JSON.parse(JSON.stringify(tonalityNote))); // empty accidentalMeasure on new measure
						}
						inTie = false;
						tieNotesNumber++;
						if (typeof tieNotesObject.getDuration === "undefined") {
							// case the tieNotes have not been yet created (it's a particular case where tie note is tie with nothing)
							// It happens when we take a chunk of a melody
							tieNotesObject = midiSoundModel = new MidiSoundModel({
								'midiNote': midiNote,
								'type': 'melody',
								'currentTime': currentTime,
								'duration': duration,
								'noteModel': note
							});
						} else {
							// usual case
							tieNotesObject.setDuration(tieNotesObject.getDuration(numBeats) + duration);
						}
						tieNotesObject.tieNotesNumber = tieNotesNumber;
						midiSoundModel = tieNotesObject;
						song.push(tieNotesObject);
						tieNotesNumber = 0;
					}
				} else {
					midiSoundModel = new MidiSoundModel({
						'midiNote': midiNote,
						'type': 'melody',
						'currentTime': currentTime,
						'duration': duration,
						'noteModel': note
					});
					song.push(midiSoundModel);
				}
			}
			note.setMidiSoundModel(midiSoundModel);
			currentTime += duration;
		}
	}
	return song;

	function getAccidentalNoteKey(note) {
		if (typeof note === "undefined") {
			return;
		}
		var noteKey = [];
		var currentNoteKey;

		var accidental, pitchClass;
		for (var i = 0; i < note.getNumPitches(); i++) {
			accidental = note.getAccidental(i);
			pitchClass = note.getPitchClass(i);
			if (accidental === "n") {
				accidentalMeasure[pitchClass] = pitchClass;
			} else if (accidental === "#") {
				accidentalMeasure[pitchClass] = pitchClass + '#';
			} else if (accidental === "b") {
				accidentalMeasure[pitchClass] = pitchClass + 'b';
			}

			currentNoteKey = accidentalMeasure[pitchClass] + note.getOctave(i);
			currentNoteKey = MidiHelper.convertSharp2Flat(currentNoteKey);
			currentNoteKey = MidiHelper.detectImpossibleFlat(currentNoteKey);
			noteKey[i] = currentNoteKey;
		}

		return [noteKey, accidentalMeasure];
	}


	function convertTonality2AlteredNote(key) {
		if (typeof key === "undefined") {
			return;
		}
		var alteredNote = {
			'A': 'A',
			'B': 'B',
			'C': 'C',
			'D': 'D',
			'E': 'E',
			'F': 'F',
			'G': 'G'
		};
		switch (key) {
			case "Cb":
				jQuery.extend(alteredNote, {
					'B': 'Bb',
					'E': 'Eb',
					'A': 'Ab',
					'D': 'Db',
					'G': 'Gb',
					'C': 'Cb',
					'F': 'Fb'
				});
				break;
			case "Gb":
				jQuery.extend(alteredNote, {
					'B': 'Bb',
					'E': 'Eb',
					'A': 'Ab',
					'D': 'Db',
					'G': 'Gb',
					'C': 'Cb'
				});
				break;
			case "Db":
				jQuery.extend(alteredNote, {
					'B': 'Bb',
					'E': 'Eb',
					'A': 'Ab',
					'D': 'Db',
					'G': 'Gb'
				});
				break;
			case "Ab":
				jQuery.extend(alteredNote, {
					'B': 'Bb',
					'E': 'Eb',
					'A': 'Ab',
					'D': 'Db'
				});
				break;
			case "Eb":
				jQuery.extend(alteredNote, {
					'B': 'Bb',
					'E': 'Eb',
					'A': 'Ab'
				});
				break;
			case "Bb":
				jQuery.extend(alteredNote, {
					'B': 'Bb',
					'E': 'Eb'
				});
				break;
			case "F":
				jQuery.extend(alteredNote, {
					'B': 'Bb'
				});
				break;
			case "C":
				// No alteration on C
				break;
			case "G":
				jQuery.extend(alteredNote, {
					'F': 'F#'
				});
				break;
			case "D":
				jQuery.extend(alteredNote, {
					'F': 'F#',
					'C': 'C#'
				});
				break;
			case "A":
				jQuery.extend(alteredNote, {
					'F': 'F#',
					'C': 'C#',
					'G': 'G#'
				});
				break;
			case "E":
				jQuery.extend(alteredNote, {
					'F': 'F#',
					'C': 'C#',
					'G': 'G#',
					'D': 'D#'
				});
				break;
			case "B":
				jQuery.extend(alteredNote, {
					'F': 'F#',
					'C': 'C#',
					'G': 'G#',
					'D': 'D#',
					'A': 'A#'
				});
				break;
			case "F#":
				jQuery.extend(alteredNote, {
					'F': 'F#',
					'C': 'C#',
					'G': 'G#',
					'D': 'D#',
					'A': 'A#',
					'E': 'E#'
				});
				break;
			case "C#":
				jQuery.extend(alteredNote, {
					'F': 'F#',
					'C': 'C#',
					'G': 'G#',
					'D': 'D#',
					'A': 'A#',
					'E': 'E#',
					'B': 'B#'
				});
				break;
		}
		return alteredNote;
	}
}