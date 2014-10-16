define(function() {
	function SectionModel(option) {
		if (typeof option === "undefined") {
			option = {};
		}
		this.name = (typeof(option.name) !== "undefined") ? option.name : '';
		this.repeatTime = (typeof(option.repeatTime) !== "undefined") ? option.repeatTime : 0;
		this.numberOfBars = (typeof(option.numberOfBars) !== "undefined") ? option.numberOfBars : 0;
		this.style = (typeof(option.style) !== "undefined") ? option.style : '';
		this.timeSignature = (typeof(option.timeSignature) !== "undefined") ? option.timeSignature : undefined; // empty timeSignature means it doesn't change from previous 
	}

	/////////////////////////
	// Basic getter setter //
	/////////////////////////

	SectionModel.prototype.setName = function(name) {
		if (typeof name === "undefined") {
			throw 'SectionModel - name should not be undefined';
		}
		this.name = name;
	};

	SectionModel.prototype.getName = function() {
		return this.name;
	};

	SectionModel.prototype.setRepeatTimes = function(repeatTime) {
		if (typeof repeatTime === "undefined" || isNaN(repeatTime) || repeatTime < 0) {
			throw 'SectionModel - repeatTime should be an integer';
		}
		this.repeatTime = repeatTime;
	};

	SectionModel.prototype.getRepeatTimes = function() {
		return this.repeatTime;
	};

	SectionModel.prototype.setNumberOfBars = function(numBars) {
		if (typeof numBars === "undefined" || isNaN(numBars) || numBars < 0) {
			throw 'SectionModel - numBars should be an integer';
		}
		this.numberOfBars = numBars;
		return true;
	};

	SectionModel.prototype.getNumberOfBars = function() {
		return this.numberOfBars;
	};

	SectionModel.prototype.setStyle = function(style) {
		this.style = style;
	};

	SectionModel.prototype.getStyle = function() {
		return this.style;
	};

	SectionModel.prototype.setTimeSignature = function(timeSignature) {
		this.timeSignature = timeSignature;
	};

	SectionModel.prototype.getTimeSignature = function() {
		return this.timeSignature;
	};


	return SectionModel;
});