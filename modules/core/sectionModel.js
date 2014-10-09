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
		if (typeof style === "undefined") {
			throw 'SectionModel - style should not be undefined';
		}
		this.style = style;
	};

	SectionModel.prototype.getStyle = function() {
		return this.style;
	};

	SectionModel.prototype.setTimeSignature = function(timeSignature) {
		if (typeof timeSignature === "undefined") {
			throw 'SectionModel - timeSignature should not be undefined';
		}
		this.timeSignature = timeSignature;
	};

	SectionModel.prototype.getTimeSignature = function() {
		return this.timeSignature;
	};


	/////////////////////////
	//  Advanced function  //
	/////////////////////////

	SectionModel.prototype.exportToMusicCSLJSON = function() {
		var sectionMusicCSLJSON = {};
		sectionMusicCSLJSON.name = this.getName();

		if (this.getTimeSignature())
			sectionMusicCSLJSON.timeSig = this.getTimeSignature();

		if (this.getRepeatTimes())
			sectionMusicCSLJSON.repeat = this.getRepeatTimes();

		if (this.getStyle())
			sectionMusicCSLJSON.style = this.getStyle();

		return sectionMusicCSLJSON;
	};

	SectionModel.prototype.importFromMusicCSLJSON = function(section) {
		//console.log(section);
		this.setName(section.name);
		this.setNumberOfBars(section.bars.length);
		this.setTimeSignature(section.timeSig);
		this.setRepeatTimes(section.repeat ? parseInt(section.repeat) : 0);
		this.setStyle(section.style);
	};
	return SectionModel;
});