define(function() {
	/**
     * Section fundamental model
     * @exports core/SectionModel
	 */
	function SectionModel(params) {
		params = params || {};

		this.setName(params.name);
		this.setRepeatTimes(params.repeatTimes);
		this.setNumberOfBars(params.numberOfBars);
		this.setStyle(params.style);
		this.setTimeSignature(params.timeSignature);
	}

	/////////////////////////
	// Basic getters setters //
	/////////////////////////

	SectionModel.prototype.setName = function(name) {
		/*using 'name !== undefined' instead of 'typeof "undefined"', because then (ternary if) everything is in same line, 
		and it is more readable like this*/
		this.name = (name !== undefined) ? name : '';
	};

	SectionModel.prototype.getName = function() {
		return this.name;
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