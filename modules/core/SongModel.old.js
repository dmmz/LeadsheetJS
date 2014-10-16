	//following code is NON tested code

	SongModel.prototype.getBeatsFromTimeSignatureAt = function(barNumber) {
		return this.getBeatsFromTimeSignature(this.getTimeSignatureAt(barNumber));
	}

	

	/**
	 * @param  {string} timeSig, optional
	 * @return {int} number of quarter beats in a measure, e.g. for 6/8 -> 3, for 4/4 -> 4, for 2/2 -> 4
	 */
	SongModel.prototype.getQuarterBeatsFromTimeSignature = function(timeSig) {
		var beats = this.getBeatsFromTimeSignature(timeSig);
		var beatUnit = this.getBeatUnitFromTimeSignature(timeSig);
		return beats * beatUnit;
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




	SongModel.prototype.clearSections = function() {
		this.sections = [];
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



	SongModel.prototype.clearComponents = function() {
		this.components = [];
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
