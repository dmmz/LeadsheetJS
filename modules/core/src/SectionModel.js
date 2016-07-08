define(function() {
	/**
     * Section fundamental model
     * @exports core/SectionModel
	 */
	function SectionModel(params) {
		params = params || {};
		
		this.REPEAT_OPEN = -1;

		this.setName(params.name);
		this.setRepeatTimes(params.repeatTimes);
		this.setNumberOfBars(params.numberOfBars);
		this.setStyle(params.style);
		this.setTimeSignature(params.timeSignature);
		this.baseBarNumbers = [];
		this.endingsBarNumbers = [];
		this.labels = {}; //key: label name, value: index of bar (relative to section, 0-based)
		this.sublabels = {}; //key: label name, value: index of bar

	}

	/////////////////////////
	// Basic getters setters //
	/////////////////////////

	SectionModel.prototype.hasOpenRepeats = function() {
		return this.repeatTimes === this.REPEAT_OPEN;
	};

	SectionModel.prototype.getNumEndings = function() {
		return this.endingsBarNumbers.length;
	};

	SectionModel.prototype.hasEndings = function() {
		return this.getNumEndings() > 0;
	};

	SectionModel.prototype.getNumTimesToPlay = function() {
		if (this.hasEndings()){
			return this.getNumEndings();
		}else if (this.hasOpenRepeats()){
			return REPEAT_OPEN;
		}else{
			return this.repeatTimes + 1;
		}
	};

	SectionModel.prototype.isNamedCoda = function() {
		return this.name.trim().toLowerCase()  === 'coda';
	};
	
	SectionModel.prototype.isNamedCoda2 = function() {
		return this.name.trim().toLowerCase()  === 'coda2';
	};
	
	SectionModel.prototype.addBaseBarNumber = function(barNumber) {
		this.baseBarNumbers.push(barNumber);
	};
	/**
	 * [addEndingsBarNumber description]
	 * @param {String} ending    starting from one "1", "2" 
	 * @param {[type]} barNumber [description]
	 */
	SectionModel.prototype.addEndingsBarNumber = function(ending, barNumber) {
		var endingPos = Number(ending) - 1;
		
		if (this.endingsBarNumbers.length <= endingPos) {
			var arrayEnding = [];
			this.endingsBarNumbers.push(arrayEnding);
		}
		this.endingsBarNumbers[endingPos].push(barNumber);
	};

	SectionModel.prototype.setName = function(name) {
		/*using 'name !== undefined' instead of 'typeof "undefined"', because then (ternary if) everything is in same line, 
		and it is more readable like this*/
		this.name = (name !== undefined) ? name : '';
	};

	SectionModel.prototype.getName = function() {
		return this.name;
	};

	SectionModel.prototype.getPlayBarNumbers = function(playIndex) {
		var barNumbers = this.baseBarNumbers.slice(0); //we clone
		if (this.hasEndings()){
			barNumbers = barNumbers.concat(this.endingsBarNumbers[playIndex]);
		}
		return barNumbers;
	};

	SectionModel.prototype.getPartPlayBarNumbers = function(playIndex, fromBar, toBar) {
		var fullBarNumbers = this.getPlayBarNumbers(playIndex);
		if (toBar <= 0) {
			toBar = fullBarNumbers[fullBarNumbers.length - 1];
		}
		var partBarNumbers = [];
		var startReached = false;
		for (var i = 0; i < fullBarNumbers.length; i++) {
			if (fullBarNumbers[i] === fromBar)  {
				startReached = true;
			}
			if (!startReached) {
				continue;
			}
			partBarNumbers.push(fullBarNumbers[i]);
			if (fullBarNumbers[i] === toBar) {
				break;
			}
		}
		return partBarNumbers; 
	};

	SectionModel.prototype.getLastPlayIndex = function(first_argument) {
		return this.hasOpenRepeats() ? 0 : this.getNumTimesToPlay() - 1;
	};

	SectionModel.prototype.getPlayEndBar = function(playIndex) {
		var barIndexes = this.getPlayBarNumbers(playIndex);
		if (barIndexes.length === 0){
			return -1;
		}
		return barIndexes[barIndexes.length - 1];
	};

	SectionModel.prototype.getPlayIndexOfBar = function(barNumber) {
		if (this.baseBarNumbers.indexOf(barNumber) !== -1) { 
			return 0;
		} else {
			for (var ending = 0; ending < this.getNumTimesToPlay(); ending++) {
				if (this.endingsBarNumbers.length !== 0 && this.endingsBarNumbers[ending].indexOf(barNumber) !== -1){
					return ending;
				}
			}
		}
		return -1;
	};
	// Carefull, if a section is played 2 times, repeatTimes = 1
	SectionModel.prototype.setRepeatTimes = function(repeatTimes) {
		if (repeatTimes === undefined || repeatTimes === 'open') {
			repeatTimes = 0;
		}
		if (repeatTimes < 0) {
			throw "repeatTimes cannot be negative";
		}
		this.repeatTimes = parseInt(repeatTimes, 10);
	};

	SectionModel.prototype.getRepeatTimes = function() {
		return this.repeatTimes;
	};

	SectionModel.prototype.setNumberOfBars = function(numberOfBars) {
		this.numberOfBars = (numberOfBars !== undefined) ? numberOfBars : 0;
	};

	SectionModel.prototype.getNumberOfBars = function() {
		return this.numberOfBars;
	};

	SectionModel.prototype.setStyle = function(style) {
		this.style = (style !== undefined) ? style : '';
	};

	SectionModel.prototype.getStyle = function() {
		return this.style;
	};

	SectionModel.prototype.setTimeSignature = function(timeSignature) {
		this.timeSignature = (timeSignature !== undefined) ? timeSignature : undefined;
		// empty timeSignature means it doesn't change from previous 
	};

	SectionModel.prototype.getTimeSignature = function() {
		return this.timeSignature;
	};

	SectionModel.prototype.setLabels = function(bars) {
		var label, sublabel, bar;
		for (var i = 0; i < bars.length; i++) {
			bar = bars[i];
			label = bar.getLabel();
			if (label){
				this.labels[label] = i;
			}
			sublabel = bar.getSublabel();
			if (sublabel){ 
				this.sublabels[sublabel] = i;
			}
		}
	};
	SectionModel.prototype.getLabel = function(label) {
		return this.labels[label.toLowerCase()];
	};
	SectionModel.prototype.hasLabel = function(label) {
		return !!this.getLabel(label);
	};

	SectionModel.prototype.getSublabels = function() {
		return this.sublabels;
	};


	/**
	 * returns the unfolded section
	 * @param  {Number} numBars the number of bars of the unfolded section. This can be calculated by SongModel.getUnfoldedSongSection.
	 * @return {SectionModel}
	 */
	SectionModel.prototype.cloneUnfolded = function(numBars) {
		if (!numBars) throw "SectionModel - cloneUnfolded: numBars not valid :" + numBars;
		return new SectionModel({
			name: this.name,
			numberOfBars: numBars,
			style: this.style,
			timeSignature: this.timeSignature
		});
	};

	return SectionModel;
});