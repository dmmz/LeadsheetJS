define(['modules/core/src/TimeSignatureModel'],function(TimeSignatureModel) {
	function BarModel(option) {
		if (typeof option === "undefined") {
			option = {};
		}
		this.begining = (typeof(option.begining) !== "undefined") ? option.begining : undefined;
		this.clef = (typeof(option.clef) !== "undefined") ? option.clef : undefined; // empty clef means it doesn't change from previous 
		this.ending = (typeof(option.ending) !== "undefined") ? option.ending : undefined; // object with repeat, type (BEGIN,END, BEGIN_END, MID) and ending (text)
		this.style = (typeof(option.style) !== "undefined") ? option.style : '';
		this.timeSignature = (typeof(option.timeSignature) !== "undefined") ? option.timeSignature : undefined; // empty timeSignature means it doesn't change from previous 
		this.tonality = (typeof(option.tonality) !== "undefined") ? option.tonality : undefined;
		this.label = (typeof(option.label) !== "undefined") ? option.label : undefined;
		this.sublabel = (typeof(option.sublabel) !== "undefined") ? option.sublabel : undefined;
	}


	BarModel.prototype.setBegining = function(begining) {
		if (typeof begining === "undefined") {
			throw 'BarModel - begining should not be undefined';
		}
		this.begining = begining;
	};

	BarModel.prototype.getBegining = function() {
		return this.begining;
	};

	BarModel.prototype.setClef = function(clef) {
		var clefType = ['', 'treble', 'bass', 'alto', 'tenor', 'percussion'];
		if (typeof clef === "undefined" && typeof clefType[clef] === "undefined") {
			throw 'BarModel - clef should not be undefined';
		}
		this.clef = clef;
	};

	BarModel.prototype.getClef = function() {
		return this.clef;
	};

	BarModel.prototype.setEnding = function(ending) {
		if (typeof ending === "undefined") {
			throw 'BarModel - ending should not be undefined';
		}
		this.ending = ending;
	};

	BarModel.prototype.getEnding = function() {
		return this.ending;
	};

	BarModel.prototype.setStyle = function(style) {
		if (typeof style === "undefined") {
			throw 'BarModel - style should not be undefined';
		}
		this.style = style;
	};

	BarModel.prototype.getStyle = function() {
		return this.style;
	};

	BarModel.prototype.setTimeSignature = function(timeSignature) {
		this.timeSignature = new TimeSignatureModel(timeSignature);
	};

	BarModel.prototype.getTimeSignature = function() {
		return this.timeSignature;
	};

	BarModel.prototype.setTonality = function(tonality) {
		if (typeof tonality === "undefined") {
			throw 'BarModel - tonality should not be undefined';
		}
		this.tonality = tonality;
	};

	BarModel.prototype.getTonality = function() {
		return this.tonality;
	};

	BarModel.prototype.setLabel = function(label) {
		if (typeof label === "undefined") {
			throw 'BarModel - label should not be undefined';
		}
		this.label = label;
	};

	BarModel.prototype.getLabel = function() {
		return this.label;
	};

	BarModel.prototype.setSublabel = function(sublabel) {
		if (typeof sublabel === "undefined") {
			throw 'BarModel - sublabel should not be undefined';
		}
		this.sublabel = sublabel;
	};
	
	/**
	 *
	 * @param  {boolan} formatted : if true, it returns formatted example for drawing.
	 * @return {String}  e.g.: if formatted -> "DC_AL_CODA"; else -> "DC al Coda"
	 */
	BarModel.prototype.getSublabel = function(formatted) {
		if (formatted && typeof this.sublabel !== 'undefined') {
			return this.sublabel.replace(/ /g, "_").toUpperCase();
		} else {
			return this.sublabel;
		}
	};

	BarModel.prototype.clone = function() {
		return new BarModel(this);
	};

	return BarModel;
});