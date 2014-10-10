define(['modules/core/NoteManager', 'modules/core/BarManager'], function(NoteManager, BarManager) {
	function SongModel(MusicCSLJSON) {
		this.composers = [];
		this.sections = [];
		this.components = [];

		if (MusicCSLJSON != null) {
			this.importFromMusicCSLJSON(MusicCSLJSON);
		} else { //construct from scratch
			this.setTimeSignature("4/4");
			this.setTonality("C");
			this.addComponent('notes', new NoteManager());
			this.addComponent('bars', new BarManager());
		}
	}

	/////////////////////////
	// Basic getters and setters //
	/////////////////////////

	SongModel.prototype.getTitle = function() {
		return this.title;
	};
	SongModel.prototype.setTitle = function(title) {
		this.title = title;
	};

	SongModel.prototype.getComposer = function(i) {
		i = i || 0;
		return this.composers[i];
	};
	SongModel.prototype.addComposer = function(composer) {
		if (typeof composer !== "undefined") {
			this.composers.push(composer);
			return true;
		}
		return false;
	};
	/*SongModel.prototype.clearComposers = function(composer) {
		if (typeof composer !== "undefined") {
			this.composers = [];
			return true;
		}
		return false;
	};*/

	SongModel.prototype.getSource = function() {
		return this.source;
	};

	SongModel.prototype.setSource = function(source) {
		if (typeof source !== "undefined") {
			this.source = source;
			return true;
		}
		return false;
	};

	SongModel.prototype.getStyle = function() {
		return this.style;
	};

	SongModel.prototype.setStyle = function(style) {
		if (typeof style !== "undefined") {
			this.style = style;
			return true;
		}
		return false;
	};

	SongModel.prototype.setTempo = function(tempo) {
		this.tempo = tempo;
	};
	SongModel.prototype.getTempo = function() {
		return this.tempo;
	};

	SongModel.prototype.getTonality = function() {
		return this.tonality;
	};

	SongModel.prototype.setTonality = function(tonality) {
		if (tonality != null) {
			this.tonality = tonality;
			return true;
		}
		return false;
	};

	/**
	 * Get the tonality of a bar by looping for each previous bar or by default on song tonality
	 * @param  {int} barNumber
	 * @return {string} eg. C, Bb etc
	 */
	SongModel.prototype.getTonalityAt = function(barNumber) {
		if (typeof barNumber === "undefined" || !isNaN(barNumber)) {
			throw "invalid barNumber " + barNumber;
		}
		var currentTonality = this.tonality;
		var tonality;
		while (barNumber >= 0) {
			if (this.getBar(barNumber) != null) {
				tonality = this.getBar(barNumber).getTonality();
				if (typeof tonality !== "undefined" && tonality !== '') {
					return tonality;
				}
			}
			barNumber--;
		}
		return currentTonality;
	};

	SongModel.prototype.getTimeSignature = function() {
		return this.timeSignature;
	};

	SongModel.prototype.setTimeSignature = function(timeSignature) {
		if (!timeSignature) {
			throw "invalid timeSignature "
		}
		if (typeof timeSignature !== "undefined") {
			this.timeSignature = timeSignature;
			return true;
		}
		return false;
	}

	/**
	 * GetTimeSignatureAt returns the time signature at one precise moment defined by the barNumber
	 * @param  {int} barNumber
	 * @return {string} currentTimeSignature like 3/4
	 */
	SongModel.prototype.getTimeSignatureAt = function(barNumber) {
		var currentTimeSignature = this.getTimeSignature();
		if (typeof barNumber !== "undefined" && !isNaN(barNumber)) {
			var timeSig;
			var sectionNumber = this.getSectionNumberFromBarNumber(barNumber);
			if (typeof sectionNumber === "undefined") {
				return currentTimeSignature;
			}
			var startBarSection = this.getStartBarNumberFromSectionNumber(sectionNumber);
			// loop in all previous bar in the current section
			while (barNumber >= startBarSection) {
				// INFO If typeof was commented, it's usefull in case barNumber does not exist
				if (typeof this.getBar(barNumber) !== "undefined") {
					timeSig = this.getBar(barNumber).getTimeSignature();
					if (typeof timeSig !== "undefined") {
						return timeSig;
					}
				}
				barNumber--;
			}
			// loop in current Section attributes
			timeSig = this.getSection(sectionNumber).getTimeSignature();
			if (typeof timeSig !== "undefined") {
				return timeSig;
			}
		}
		// otherwise returns song timeSig
		return currentTimeSignature;
	};
	SongModel.prototype.getBeatsFromTimeSignatureAt = function(barNumber) {
		return this.getBeatsFromTimeSignature(this.getTimeSignatureAt(barNumber));
	}

	/**
	 * The function returns the number of beats from the timeSig arguments or by default on current timeSignature
	 * @param  {string} timeSig, optional
	 * @return {int} number of beats in a measure  in the unit of the signature. E.g.: for 6/8 -> 6, for 4/4 -> 4 for 2/2 -> 2
	 */
	SongModel.prototype.getBeatsFromTimeSignature = function(timeSig) {
		if (typeof timeSig !== "undefined") {
			return parseInt(timeSig.split("/")[0], null);
		}
		return parseInt(this.timeSignature.split("/")[0], null);
	};

	/**
	 * @param  {string} timeSig, optional
	 * @return {int} number of quarter beats in a measure, e.g. for 6/8 -> 3, for 4/4 -> 4, for 2/2 -> 4
	 */
	SongModel.prototype.getQuarterBeatsFromTimeSignature = function(timeSig) {
		var beats = this.getBeatsFromTimeSignature(timeSig);
		var beatUnit = this.getBeatUnitFromTimeSignature(timeSig);
		return beats * beatUnit;
	};


	/**
	 * The function returns the beats unit from the timeSig arguments or by default on current timeSignature
	 * @param  {string} timeSig, optionnal
	 * @return {int} beat unit in a measure
	 */
	SongModel.prototype.getBeatUnitFromTimeSignature = function(timeSig) {
		if (timeSig == null) timeSig = this.timeSignature;
		var u = parseInt(timeSig.split("/")[1], null);
		return 4 / u;
	};

	SongModel.prototype.getSections = function() {
		return this.sections;
	};

	SongModel.prototype.getNumSections = function() {
		return this.sections.length;
	};

	/**
	 *
	 * @param  {Integer} 	beat
	 * @return {Object}      @param  {Object} pos {	numBar: valNumBar,
	 *                      	        	  		numBeat: valNumBeatInBar}
	 */
	SongModel.prototype.getPositionFromBeat = function(beat) {

		var numBar = -1;
		var barStartBeat = 1;
		var numBeats = 0;
		var rBeat;
		while (numBar <= this.getTotalNumberOfBars()) {
			numBar++;
			numBeats = this.getBeatsFromTimeSignature(this.getTimeSignatureAt(numBar));
			rBeat = barStartBeat;

			barStartBeat += numBeats;
			if (barStartBeat > beat) break;
		}
		return {
			numBar: numBar,
			numBeat: beat - rBeat + 1
		}
	};
	/**
	 
	 * @param  {Object} pos {	numBar: valNumBar,
	 *                 	  		numBeat: valNumBeatInBar}
	 * @return {Integer}     
	 */
	SongModel.prototype.getBeatFromPosition = function(pos) {
		var numBar = 0;
		var numBeats = 0;
		while (numBar < pos.numBar) {
			numBeats += this.getBeatsFromTimeSignature(this.getTimeSignatureAt(numBar));
			numBar++;
		}
		return numBeats + pos.numBeat;
	};

	/**
	 * (if no index specified , returns all sections (<-revise?))
	 * @param  {Integer} index  index of the section
	 * @return {SectionModel}
	 */
	SongModel.prototype.getSection = function(index) {
		if (typeof index !== "undefined" && !isNaN(index)) {
			return this.sections[index];
		}
		return null;
	};

	SongModel.prototype.addSection = function(sectionsItem) {
		this.sections.push(sectionsItem);
	};

	SongModel.prototype.clearSections = function() {
		this.sections = [];
	};

	SongModel.prototype.getBars = function() {
		return this.getComponent("bars").getBars();
	};

	SongModel.prototype.getBar = function(index) {
		var barMn = this.getComponent("bars");
		if (!barMn) return null;
		else return barMn.getBar(index);
	};
	/**
	 *
	 *
	 * adds bar, and if number of bars exceeds the actual count,
	 * it increments the numberOfBars of last section
	 * This happens if bars are added to inital loaded structure,
	 * for the moment is not possible
	 *
	 * @param {BarModel} barsItem
	 */
	// SongModel.prototype.addBar = function(barsItem) {
	// 	var barManager=this.getComponent("bars");
	// 	barManager.addBar(barsItem);


	// 	if (barManager.getTotal() > this.getTotalNumberOfBars()) {
	// 		var lastSection = this.getSection(this.sections.length - 1);
	// 		lastSection.setNumberOfBars(lastSection.getNumberOfBars() + 1);
	// 	}
	//};



	SongModel.prototype.getNumSections = function() {
		return this.sections.length;
	};

	/**
	 * gets component (either chords or notes)
	 * @param  {String} componentTitle must be "chords" or "notes" or "bars"
	 * @return {NoteManagerModel or ChordManagerModel}
	 */
	SongModel.prototype.getComponent = function(componentTitle) {

		if (this.components.hasOwnProperty(componentTitle))
			return this.components[componentTitle];
		else
			return undefined;
	};

	SongModel.prototype.addComponent = function(componentTitle, componentItem) {
		if (!componentItem) return false;
		this.components[componentTitle] = componentItem;
		return true;

	};


	SongModel.prototype.clearComponents = function() {
		this.components = [];
	};



	/////////////////////////
	//  Advanced functions  //
	/////////////////////////

	SongModel.prototype.exportToMusicCSLJSON = function() {

		var MusicCSLJSON = {};
		MusicCSLJSON._id = this._id;
		MusicCSLJSON.title = this.getTitle();
		var composer = this.getComposer();
		if (typeof composer !== "undefined") {
			composer = composer.toString();
		}
		MusicCSLJSON.composer = composer;
		MusicCSLJSON.time = this.getTimeSignature();
		MusicCSLJSON.keySignature = this.getTonality();
		MusicCSLJSON.tempo = this.getTempo();

		MusicCSLJSON.style = this.getStyle();
		MusicCSLJSON.source = this.getSource();

		// Sections
		var section = {};
		var startbarNumber, barNumber, currentBar;
		MusicCSLJSON.changes = [];
		for (var i = 0, c = this.getSections().length; i < c; i++) {
			// section information
			section = this.getSection(i).exportToMusicCSLJSON();

			// bar information
			startBar = this.getStartBarNumberFromSectionNumber(i);
			lastBarSection = startBar + this.getSection(i).getNumberOfBars() - 1;

			var bars = [];
			var bar, chords, melody;

			for (var j = startBar; j <= lastBarSection; j++) {

				bar = this.getBar(j).exportToMusicCSLJSON();


				chords = [];
				barChords = this.getComponentsAtBarNumber(j, 'chords');
				//jsLint complains but nevermind
				barChords.forEach(function(chord) {
					chords.push(chord.exportToMusicCSLJSON());
				});

				if (chords.length != 0)
					bar.chords = chords;

				barNotes = this.getComponentsAtBarNumber(j, 'notes');

				melody = [];
				barNotes.forEach(function(note) {
					melody.push(note.exportToMusicCSLJSON());
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

	SongModel.prototype.importFromMusicCSLJSON = function(MusicCSLJSON, id) {
		var self = this;
		var chordManager = new ChordManagerModel({
			songModel: this
		});
		var noteManager = new NoteManagerModel();
		var barManager = new BarManagerModel();

		//if (!MusicCSLJSON._id && !id)	throw "SongModel: importing from MusicCSL no id specified";

		//there are 3 cases: id by param, _id is 'MongoId' or _id is string
		this._id = (MusicCSLJSON._id) ? MusicCSLJSON._id['$id'] : id;
		if (!this._id)
			this._id = MusicCSLJSON._id;

		if (typeof MusicCSLJSON !== "undefined") {

			this.setTitle(MusicCSLJSON.title);
			this.setTimeSignature(MusicCSLJSON.time);
			this.setTonality(MusicCSLJSON.keySignature);
			this.addComposer(MusicCSLJSON.composer);
			this.setStyle(MusicCSLJSON.style);
			this.setSource(MusicCSLJSON.source);
			this.setTempo(MusicCSLJSON.tempo);

			var section, chord, note, bar;
			var existsMelody = false;
			var barNumber = 0;
			if (MusicCSLJSON.changes != null) {
				MusicCSLJSON.changes.forEach(function(JSONSection) {

					section = new SectionModel();
					section.importFromMusicCSLJSON(JSONSection);
					self.addSection(section);

					if (JSONSection.bars != null) {
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
				this.addComponent('bars', barManager);
				noteManager.setNotesBarNum(self);
				this.addComponent('chords', chordManager);
				this.addComponent('notes', noteManager);



			}
		}
		//this.getUnfoldedSongStructure();
	};

	/**
	 * gets the total according to the information on Sections
	 */
	SongModel.prototype.getTotalNumberOfBars = function() {
		var barNumber = 0;
		for (var i = 0, c = this.getSections().length; i < c; i++) {
			if (typeof this.getSection(i) !== "undefined") {
				barNumber += this.getSection(i).getNumberOfBars();
			}
		}
		return barNumber;
	};


	//Comented because not used
	/**
	 * Function returns all components of the song, componentTitle attriubtes is a filter for component title (eg chords, notes...)
	 * @param  {string} componentTitle will filter all the result depending the type (chords, notes...)
	 * @return {array} it returns an array of the direct object
	 */
	/*SongModel.prototype.getSongComponents = function(componentTitle) {
		var song = [];
		for (var i = 0, c = this.sections.length; i < c; i++) {
			var startBar = this.getStartBarNumberFromSectionNumber(i);
			var barNumber = this.sections[i].getNumberOfBars();
			for (var j = startBar; j < barNumber; j++) {
				song.push(this.getComponentsAtBarNumber(j, componentTitle));
			}
		}
		return song;
	};*/


	SongModel.prototype.getUnfoldedSongComponents = function(componentTitle) {
		var song = [];
		if (typeof componentTitle === "undefined") {
			componentTitle = undefined;
		}
		var barsIndex = this.getUnfoldedSongStructure();
		for (var i = 0; i < barsIndex.length; i++) {
			song.push(this.getComponentsAtBarNumber(barsIndex[i], componentTitle));
		}
		return song;
	}

	/**
	 * Function return an array containing index of bars in an unfolded song
	 * @return {array}
	 */
	SongModel.prototype.getUnfoldedSongStructure = function() {
		var pointerbarNumberStructure = [];
		for (var i = 0, c = this.getSections().length; i < c; i++) {
			// looping on all sections
			pointerbarNumberStructure = pointerbarNumberStructure.concat(this.getUnfoldedSongSection(i));
		}
		return pointerbarNumberStructure;
	}

	/**
	 * Function return an array containing index of bars in an unfolded song
	 * @return {array}
	 */
	SongModel.prototype.getUnfoldedSongSection = function(sectionNumber) {
		if (typeof sectionNumber !== "undefined" && !isNaN(sectionNumber)) {
			var pointerbarNumberStructure = [];
			var endingBar;
			var alreadyAddedbars = []; // contain the bars that are in 1 part so when we will look in 2 part they will not be getted
			var currentRepeatedPart = 0;
			var section = this.getSection(sectionNumber);
			var repeat = section.getRepeatTimes();
			var whileSecurity = 0;
			while (repeat >= 0 || whileSecurity > 1000) {
				whileSecurity++;
				// looping in all sections repeat
				alreadyAddedbars = [];
				currentRepeatedPart = 0;
				startBar = this.getStartBarNumberFromSectionNumber(sectionNumber);
				endBar = startBar + section.getNumberOfBars();
				for (var barNumber = startBar; barNumber < endBar; barNumber++) {
					if ($.inArray(barNumber, alreadyAddedbars) === -1) { // excluding first part if there is one
						endingBar = this.getBar(barNumber).getEnding();
						pointerbarNumberStructure.push(barNumber);

						// Case bars after the 1 start
						if (currentRepeatedPart == 1) {
							alreadyAddedbars.push(barNumber);
						}
						// Case bars got a 1 repetition (it happen only to the first bar repeated)
						if (typeof endingBar !== "undefined" && endingBar == 1) {
							alreadyAddedbars.push(barNumber);
							currentRepeatedPart = 1;
						}

						//  Case bars got a 2 repetition (it happen only to the first repeated bar)
						if (typeof endingBar !== "undefined" && endingBar == 2) {
							// case it's the first time we arrive on 2
							if (currentRepeatedPart == 1) {
								pointerbarNumberStructure.pop();
								alreadyAddedbars.pop();
								barNumber = startBar - 1;
								currentRepeatedPart++;
							}
						}

					}
				}
				repeat--;
			}
			return pointerbarNumberStructure;
		}
	}

	/**
	 * Function return the start bar number of any section, first bar is 0
	 * @param  {int} sectionNumber
	 * @return {int} start Bar Number of section
	 */
	SongModel.prototype.getStartBarNumberFromSectionNumber = function(sectionNumber) {
		var barNumber = 0;
		if (typeof sectionNumber !== "undefined" && !isNaN(sectionNumber)) {
			for (var i = 0, c = sectionNumber; i < c; i++) {
				if (typeof this.getSection(i) !== "undefined") {
					barNumber += this.getSection(i).getNumberOfBars();
				}
			}
		}
		return barNumber;
	};

	SongModel.prototype.getSectionNumberFromBarNumber = function(barNumber) {
		if (typeof barNumber !== "undefined" && !isNaN(barNumber) && barNumber >= 0) {
			var sections = this.getSections();
			var sumBar = 0;
			for (var i = 0; i < sections.length; i++) {
				if (typeof sections[i] !== "undefined") {
					sumBar += sections[i].getNumberOfBars();
					if (sumBar > barNumber) {
						return i;
					}
				}
			}
		}
		return undefined;
	}

	/**
	 * Function return all components in a given section number, componentTitle attriubtes is a filter for component title (eg chords, notes...)
	 * @param  {int} sectionNumber
	 * @param  {string} componentTitle will filter all the result depending the type (chords, notes...)
	 * @return {array} it return an array of the direct object
	 */
	SongModel.prototype.getComponentsAtSectionNumber = function(sectionNumber, componentTitle) {
		var components = [];
		if (typeof this.sections[sectionNumber] !== "undefined") {
			var startBar = this.getStartBarNumberFromSectionNumber(sectionNumber);
			var barNumber = this.sections[sectionNumber].getNumberOfBars();
			for (var i = startBar, c = barNumber; i < c; i++) {
				components.push(this.getComponentsAtBarNumber(i, componentTitle));
			}
		}
		return components;
	};

	/**
	 * Function return all components in a given bar number, componentTitle attriubtes is a filter for component title (eg chords, notes...)
	 * @param  {int} barNumber
	 * @param  {string} componentTitle will filter all the result depending the type (chords, notes...)
	 * @return {array} it return an array of the direct object
	 */
	SongModel.prototype.getComponentsAtBarNumber = function(barNumber, componentTitle) {
		var components = [];

		if (typeof componentTitle === "undefined" || !this.components.hasOwnProperty(componentTitle)) {
			console.error('the item is matching no known type in getComponentsAtBarNumber');
			return;
		}

		var modelManager = this.components[componentTitle];
		if (typeof ChordManagerModel !== "undefined" && modelManager instanceof ChordManagerModel) {
			var chords = modelManager.getChordsByBarNumber(barNumber);
			for (var i = 0; i < chords.length; i++) {
				components.push(chords[i]);
			}
		} else if (typeof NoteManagerModel !== "undefined" && modelManager instanceof NoteManagerModel) {
			var notes = components.concat(modelManager.getNotesByBarNumber(barNumber));
			for (var j = 0; j < notes.length; j++) {
				components.push(notes[j]);
			}
		}
		return components;
	};

	/**
	 * Function returns the number of beats before a bar number.
	 * Example: in a 4/4 timesignature, for barNumber 0 will return 0, for barNumber 1 will return 4
	 * IT'S NOT the first beat of the bar. First beat is the returned numberOfBeats + 1 (e.g: for barNum 0 is 1, for barNumber 1 is 5),
	 * we return instead the numberOfBeats 'before'
	 *
	 * @param  {int} barNumber
	 * @return {int} number of beats to reach barNumber
	 */
	SongModel.prototype.getBeatsBeforeBarNumber = function(barNumber) {
		var numberOfBeats = 0;
		if (typeof barNumber !== "undefined" && !isNaN(barNumber) && barNumber >= 0) {
			for (var i = 0; i < barNumber; i++) {
				numberOfBeats += this.getBeatsFromTimeSignatureAt(i);
			}
		}
		return numberOfBeats;
	}

	SongModel.prototype.getFirstBeatOfBarNumber = function(barNumber) {
		return this.getBeatsBeforeBarNumber(barNumber) + 1;
	};

	/**
	 * Function return the number of beat before a bar number in an unfolded song
	 * @param  {int} realBarNumber is the number of bar before (it is not the written number of bar)
	 * @return {int} number of beat to reach realBarNumber
	 */
	SongModel.prototype.getStartBeatFromUnfoldedBarNumber = function(realBarNumber) {
		var numberOfBeats = 0;
		if (typeof realBarNumber !== "undefined" && !isNaN(realBarNumber) && realBarNumber >= 0) {
			var barsIndex = this.getUnfoldedSongStructure();
			for (var i = 0; i < realBarNumber; i++) {
				numberOfBeats += this.getBeatsFromTimeSignatureAt(barsIndex[i]);
			}
		}
		return numberOfBeats;
	}

	/**
	 * Function return the section index from a section name, return -1 if name is not found
	 * @param  {string} name of the section
	 * @return {int} number of beat to reach realBarNumber
	 */
	SongModel.prototype.getSectionIndexFromName = function(name) {
		if (typeof this.sections !== "undefined" && typeof name !== "undefined") {
			for (var i = 0, c = this.getSections().length; i < c; i++) {
				if (name === this.getSection(i).getName()) {
					return i;
				}
			}
		}
		return -1;
	}

	SongModel.prototype.isEmpty = function() {
		return (this.sections == null || this.sections.length == 0);
	};

	return SongModel;
});