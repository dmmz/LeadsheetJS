define([
	'modules/core/src/NoteManager',
	'modules/core/src/BarManager',
	'modules/core/src/ChordManager',
	'modules/core/src/TimeSignatureModel'
], function(NoteManager, BarManager, ChordManager, TimeSignatureModel) {
	function SongModel(param) {
		this.init(param);
	}

	SongModel.prototype.init = function(param) {
		this.title = (typeof param !== "undefined" && param.title) ? param.title : '';
		this.composers = (typeof param !== "undefined" && param.composers) ? param.composers : [];
		this.style = (typeof param !== "undefined" && param.style) ? param.style : '';
		this.source = (typeof param !== "undefined" && param.source) ? param.source : '';
		this.tempo = (typeof param !== "undefined" && param.tempo) ? param.tempo : 120;
		this.tonality = (typeof param !== "undefined" && param.tonality) ? param.tonality : "C";
		this.timeSignature = (typeof param !== "undefined" && param.timeSignature) ? param.timeSignature : new TimeSignatureModel('4/4');
		this.sections = (typeof param !== "undefined" && param.sections) ? param.sections : [];
		this.components = (typeof param !== "undefined" && param.components) ? param.components : [];

		this.addComponent('notes', new NoteManager());
		this.addComponent('bars', new BarManager());
	};

	///////////////////////////////
	// Basic getters and setters //
	///////////////////////////////

	SongModel.prototype.getTitle = function() {
		return this.title;
	};
	SongModel.prototype.setTitle = function(title) {
		title = title || 'Untitled';
		this.title = title;
	};

	SongModel.prototype.getComposer = function(i) {
		i = i || 0;
		return this.composers[i];
	};
	SongModel.prototype.setComposer = function(composer) {
		composer = composer || 'No Composer';
		this.composers[0] = composer;
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

	SongModel.prototype.getStyle = function() {
		return this.style;
	};

	SongModel.prototype.setStyle = function(style) {
		if (typeof style === "undefined") {
			return;
		}
		this.style = style;
	};

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

	SongModel.prototype.setTempo = function(tempo) {
		if (typeof tempo === "undefined" || isNaN(tempo) || tempo < 0) {
			return;
		}
		this.tempo = tempo;
	};

	SongModel.prototype.getTempo = function() {
		return this.tempo;
	};

	SongModel.prototype.setTonality = function(tonality) {
		if (typeof tonality === "undefined") {
			return;
		}
		this.tonality = tonality;
	};

	SongModel.prototype.getTonality = function() {
		return this.tonality;
	};

	/**
	 * Get the tonality of a bar by looping for each previous bar or by default on song tonality
	 * @param  {int} barNumber
	 * @return {string} eg. C, Bb etc
	 */
	SongModel.prototype.getTonalityAt = function(barNumber) {
		if (typeof barNumber === "undefined" || isNaN(barNumber)) {
			throw "invalid barNumber " + barNumber;
		}
		var currentTonality = this.tonality;
		var bm = this.getComponent("bars");
		var tonality;
		while (barNumber >= 0) {
			if (bm.getBar(barNumber) != null) {
				tonality = bm.getBar(barNumber).getTonality();
				if (typeof tonality !== "undefined" && tonality !== '') {
					return tonality;
				}
			}
			barNumber--;
		}
		return currentTonality;
	};

	SongModel.prototype.setTimeSignature = function(timeSignature) {
		if (typeof timeSignature === "undefined") {
			this.timeSignature = new TimeSignatureModel('4/4');
		} else {
			this.timeSignature = new TimeSignatureModel(timeSignature);
		}
	};

	SongModel.prototype.getTimeSignature = function() {
		return this.timeSignature;
	};

	/**
	 * GetTimeSignatureAt returns the time signature at one precise moment defined by the barNumber
	 * @param  {int} barNumber
	 * @return {timeSignatureModel} currentTimeSignature like 3/4
	 */
	SongModel.prototype.getTimeSignatureAt = function(barNumber) {
		var currentTimeSignature = this.getTimeSignature();
		var timeSig;
		var sectionNumber = this.getSectionNumberFromBarNumber(barNumber);
		if (typeof sectionNumber === "undefined") {
			return currentTimeSignature; // TODO need test on song that have repetitions on last section and a time signature change
		}
		var startBarSection = this.getStartBarNumberFromSectionNumber(sectionNumber);
		var bm = this.getComponent("bars");
		// loop in all previous bar in the current section
		while (barNumber >= startBarSection) {
			timeSig = bm.getBar(barNumber).getTimeSignatureChange();
			if (typeof timeSig !== "undefined") {
				return timeSig;
			}
			barNumber--;
		}
		// loop in current Section attributes
		timeSig = this.getSection(sectionNumber).getTimeSignature();
		if (typeof timeSig !== "undefined") {
			return timeSig;
		}
		// otherwise returns song timeSig
		return currentTimeSignature;
	};


	// USELESS function, use directly timesignature function instead
	/**
	 * The function returns the number of beats from the timeSig arguments or by default on current timeSignature
	 * @param  {TimeSignatureModel} timeSig
	 * @return {int} number of beats in a measure in the unit of the signature. E.g.: for 6/8 -> 6, for 4/4 -> 4 for 2/2 -> 2
	 */
	/*SongModel.prototype.getBeatsFromTimeSignature = function(timeSig) {
		if (timeSig !== "undefined") {
			return timeSig.getBeats();
		}
	};*/
	/*
	SongModel.prototype.getBeatsFromTimeSignatureAt = function(barNumber) {
		return this.getBeatsFromTimeSignature(this.getTimeSignatureAt(barNumber));
	};
*/
	/**
	 * @param  {Integer} index  index of the section
	 * @return {SectionModel}
	 */
	SongModel.prototype.getSection = function(index) {
		if (isNaN(index) || index < 0 || index > this.sections.length) {
			throw "getSection - invalid index :" + index;
		}
		return this.sections[index];
	};
	SongModel.prototype.getSections = function() {
		return this.sections;
	};

	SongModel.prototype.addSection = function(sectionsItem) {
		this.sections.push(sectionsItem);
	};
	SongModel.prototype.removeSection = function(sectionIndex) {
		if (typeof sectionIndex === "undefined" || isNaN(sectionIndex) || sectionIndex < 0) {
			throw "SongModel - removeSection - invalid sectionIndex " + sectionIndex;
		}
		this.sections.splice(sectionIndex, 1);
	};

	/**
	 * gets component (either chords or notes)
	 * @param  {String} componentTitle must be "chords" or "notes" or "bars"
	 * @return {NoteManager or ChordManager}
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

	SongModel.prototype.getBar = function(index) {
		//TODO, remove function, duplicate
		console.warn('get bar will be deleted, use getComponent("bars") instead');
		return this.getComponent("bars").getBar(index);
	};

	/**
	 * Function has to be called inside an iteration, it checks if there is a timesignature change in current bar
	 * if not, it returns the currentBeats (calculated previously and sent as parameter		)
	 * @param  {Number} index
	 * @param  {Number}
	 * @return {Number}
	 */
	SongModel.prototype.getBarNumBeats = function(numBar, currentBeats) {
		//console.log(currentBeats, numBar, this.getComponent("bars").getTotal());
		var barTimeSig = this.getComponent("bars").getBar(numBar).getTimeSignatureChange(),
			timeSig = barTimeSig || this.getTimeSignature();
		if (!timeSig && !currentBeats) throw "bad use: either song is not well formatted, either currentBeats is not sent";

		return (timeSig) ? timeSig.getQuarterBeats() : currentBeats;
	};

	SongModel.prototype.getBars = function() {
		//TODO, remove function, duplicate
		console.warn('getBars will be deleted, use getComponent("bars").getBars() instead');
		return this.getComponent("bars").getBars();
	};


	/**
	 * get component using unfolded song structure
	 * @param  {String} componentTitle must be "chords" or "notes"
	 * @return {array} array of component (noteModel, chordModel)
	 */
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
	};

	/**
	 * Returns an array of index of bars when song if unfolded.
	 * like getUnfoldedSongSection() but for the whole song
	 * @return {array}
	 */
	SongModel.prototype.getUnfoldedSongStructure = function() {
		var pointerBarNumberStructure = [];
		for (var i = 0, c = this.getSections().length; i < c; i++) {
			pointerBarNumberStructure = pointerBarNumberStructure.concat(this.getUnfoldedSongSection(i));
		}
		return pointerBarNumberStructure;
	};

	/**
	 * Returns an array containing index of bars in an unfolded song
	 *	e.g.: [	0, 1, 2, 3, 4, 5, 6, 7,
	 *			0, 1, 2, 3, 4, 5, 8, 9]
	 * @return {array}
	 */
	SongModel.prototype.getUnfoldedSongSection = function(sectionNumber) {
		if (typeof sectionNumber !== "undefined" && !isNaN(sectionNumber)) {
			var bm = this.getComponent("bars");
			var section = this.getSection(sectionNumber);
			var repeat = section.getRepeatTimes();
			var whileSecurity = 0;
			var startBar, endBar;
			var currentRepeatedPart = 0;
			var repeatedPart = [];
			var pointerBarNumberStructure = [];
			var endingBar;
			while (repeat >= 0 || whileSecurity > 1000) {
				whileSecurity++;
				// looping in all sections repeat
				repeatedPart = [];
				currentRepeatedPart = 0;
				startBar = this.getStartBarNumberFromSectionNumber(sectionNumber);
				endBar = startBar + section.getNumberOfBars();
				for (var barNumber = startBar; barNumber < endBar; barNumber++) {
					endingBar = parseInt(bm.getBar(barNumber).getEnding(), 10);
					// case there is an ending
					if (!isNaN(endingBar) && endingBar > 0) {
						currentRepeatedPart = endingBar;
						repeat--;
					}
					// case there is no ending found yet, we save this part
					if (currentRepeatedPart === 0) {
						repeatedPart.push(barNumber);
					}
					// case there is an ending, we add saved part to begining
					if (!isNaN(endingBar) && endingBar > 1) {
						pointerBarNumberStructure = pointerBarNumberStructure.concat(repeatedPart);
					}
					pointerBarNumberStructure.push(barNumber);
				}
				repeat--;
			}
			return pointerBarNumberStructure;
		}
	};

	/**
	 * Function return the start bar number of any section, first bar is 0
	 * @param  {int} sectionNumber
	 * @return {int} start Bar Number of section
	 */
	SongModel.prototype.getStartBarNumberFromSectionNumber = function(sectionNumber) {
		if (isNaN(sectionNumber)) {
			throw "SongModel - getStartBarNumberFromSectionNumber - sectionNumber is not a number: " + sectionNumber;
		}
		var barNumber = 0;
		for (var i = 0; i < sectionNumber; i++) {
			barNumber += this.getSection(i).getNumberOfBars();
		}
		return barNumber;
	};

	/**
	 * Function return the section number in which the bar is
	 * @param  {int} barNumber
	 * @return {int} section number (index) start at 0
	 */
	SongModel.prototype.getSectionNumberFromBarNumber = function(barNumber) {
		if (typeof barNumber === "undefined" || isNaN(barNumber) || barNumber < 0) {
			throw "SongModel - getSectionNumberFromBarNumber - barNumber is not a number: " + barNumber;
		}
		var sections = this.getSections();
		var sumBar = 0;
		for (var i = 0, c = sections.length; i < c; i++) {
			if (typeof sections[i] !== "undefined") {
				sumBar += sections[i].getNumberOfBars();
				if (sumBar > barNumber) {
					return i;
				}
			}
		}
		return undefined;
	};

	/**
	 * Function return the number of beat before a bar number in a folded song
	 * @param  {int} barNumber is the number of bar you want to have the first beat
	 * @return {int} number of beat to reach realBarNumber
	 */
	SongModel.prototype.getStartBeatFromBarNumber = function(barNumber) {
		var numberOfBeats = 1;
		if (typeof barNumber !== "undefined" && !isNaN(barNumber) && barNumber >= 0) {
			for (var i = 0; i < barNumber; i++) {
				numberOfBeats += this.getTimeSignatureAt(i).getQuarterBeats();
			}
		}
		return numberOfBeats;
	};

	/**
	 * Compute song length in beats
	 * @return {int} length of the song in beats
	 */
	SongModel.prototype.getSongTotalBeats = function() {
		var numberOfBeats = 0;
		var bm = this.getComponent('bars');
		var currentNumberBeatsByBar = this.getTimeSignature().getQuarterBeats();
		var barNumber = 0;
		for (var i = 0, c = this.sections.length; i < c; i++) {
			for (var j = 0, v = this.sections[i].getNumberOfBars(); j < v; j++) {
				if (typeof bm.getBar(barNumber) !== "undefined" && typeof bm.getBar(barNumber).getTimeSignatureChange() !== "undefined") {
					currentNumberBeatsByBar = bm.getBar(barNumber).getTimeSignatureChange().getQuarterBeats();
				}
				numberOfBeats += currentNumberBeatsByBar;
				barNumber++;
			}
		}
		return numberOfBeats;
	};

	/**
	 * Returns all components in a given bar number, componentTitle attriubtes is a filter for component title (eg chords, notes...)
	 * @param  {int} barNumber
	 * @param  {string} componentTitle will filter all the result depending the type (chords, notes...)
	 * @return {array} it returns an array of the direct object
	 */
	SongModel.prototype.getComponentsAtBarNumber = function(barNumber, componentTitle) {
		var components = [];

		if (!componentTitle || !this.components.hasOwnProperty(componentTitle)) {
			throw 'the item is matching no known type in getComponentsAtBarNumber';
		}

		var modelManager = this.components[componentTitle];
		if (typeof ChordManager !== "undefined" && modelManager instanceof ChordManager) {
			var chords = modelManager.getChordsByBarNumber(barNumber);
			for (var i = 0; i < chords.length; i++) {
				components.push(chords[i]);
			}
		} else if (typeof NoteManager !== "undefined" && modelManager instanceof NoteManager) {
			var notes = components.concat(modelManager.getNotesAtBarNumber(barNumber, this));
			for (var j = 0; j < notes.length; j++) {
				components.push(notes[j]);
			}
		}
		return components;
	};

	/**
	 * Alias for init function, it can be more adapted to some situations
	 */
	SongModel.prototype.clear = function() {
		this.init();
	};

	SongModel.prototype.clone = function() {
		var songModelCloned = jQuery.extend(true, new SongModel(), this);
		return songModelCloned;
	};

	SongModel.prototype.unfold = function() {

		function getUnfoldedNotes(oldSong) {
			var barNotes = oldSong.getUnfoldedSongComponents("notes");
			var newNoteMng = new NoteManager();
			for (var i in barNotes) {
				newNoteMng.addNotes(barNotes[i]);
			}
			return newNoteMng.getNotes();
		}

		function getUnfoldedChords(oldSong) {
			var newChords = [];
			var chord;
			var barChords = oldSong.getUnfoldedSongComponents("chords");
			for (var i in barChords) {
				for (var j in barChords[i]) {
					chord = barChords[i][j].clone();
					chord.setBarNumber(i);
					newChords.push(chord);
				}
			}
			return newChords;
		}

		function getUnfoldedSectionsAndBars(oldSong) {
			var i, c, j,
				section,
				pointerBarNumberStructure,
				newSections = [],
				newBars = [],
				barMng = oldSong.getComponent("bars");

			for (i = 0, c = oldSong.getSections().length; i < c; i++) {
				section = oldSong.getSection(i);
				pointerBarNumberStructure = oldSong.getUnfoldedSongSection(i);
				newSections.push(
					section.cloneUnfolded(pointerBarNumberStructure.length)
				);

				for (j = 0; j < pointerBarNumberStructure.length; j++) {
					newBars.push(
						barMng.getBar(pointerBarNumberStructure[j]).clone(true)
					);
				}
			}
			return {
				newBars: newBars,
				newSections: newSections
			};
		}

		var oldSong = this.clone();
		// Copy basic song data.
		this.clear();
		this.setTitle(oldSong.getTitle());
		this.composers = oldSong.composers;
		this.setStyle(oldSong.getStyle());
		this.setSource(oldSong.getSource());
		this.setTempo(oldSong.getTempo());
		this.setTonality(oldSong.getTonality());
		this.setTimeSignature(oldSong.getTimeSignature().toString());


		// BARS and SECTIONS
		var r = getUnfoldedSectionsAndBars(oldSong);

		var barMng = new BarManager();
		barMng.setBars(r.newBars);

		this.sections = [];
		for (var i in r.newSections) {
			this.addSection(r.newSections[i]);
		}

		//NOTES
		var noteMng = new NoteManager();
		noteMng.setNotes(getUnfoldedNotes(oldSong));

		//CHORDS
		var chordMng = new ChordManager();
		chordMng.setAllChords(getUnfoldedChords(oldSong));

		this.addComponent('notes', noteMng);
		this.addComponent('chords', chordMng);
		this.addComponent('bars', barMng);

		return this;
	};



	return SongModel;
});