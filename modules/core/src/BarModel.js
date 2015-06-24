define(['modules/core/src/TimeSignatureModel'], function(TimeSignatureModel) {
	function BarModel(options) {
		if (typeof options === "undefined") {
			options = {};
		}
		this.begining = (typeof(options.begining) !== "undefined") ? options.begining : undefined;
		this.clef = (typeof(options.clef) !== "undefined") ? options.clef : undefined; // empty clef means it doesn't change from previous 
		this.ending = (typeof(options.ending) !== "undefined") ? options.ending : undefined; // object with repeat, type (BEGIN,END, BEGIN_END, MID) and ending (text)
		this.style = (typeof(options.style) !== "undefined") ? options.style : '';
		this.timeSignature = (typeof(options.timeSignature) !== "undefined") ? options.timeSignature : undefined; // empty timeSignature means it doesn't change from previous
		this.tonality = (typeof(options.tonality) !== "undefined") ? options.tonality : undefined;
		this.label = (typeof(options.label) !== "undefined") ? options.label : undefined; // Segno, fine, coda, on cue ...
		this.sublabel = (typeof(options.sublabel) !== "undefined") ? options.sublabel : undefined; // Ds, Ds al fine, ds al capo ...
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
			ending = undefined;
		}
		this.ending = ending;
	};
	BarModel.prototype.removeEnding = function() {
		this.ending = undefined;
	};
	BarModel.prototype.getEnding = function() {
		return this.ending;
	};

	BarModel.prototype.setStyle = function(style) {
		if (typeof style === "undefined") {
			style = '';
		}
		this.style = style;
	};

	BarModel.prototype.getStyle = function() {
		return this.style;
	};

	BarModel.prototype.setTimeSignatureChange = function(timeSignature) {
		if (!timeSignature) {
			this.timeSignature = undefined;
		} else {
			this.timeSignature = new TimeSignatureModel(timeSignature);
		}
	};

	BarModel.prototype.getTimeSignatureChange = function() {
		return this.timeSignature;
	};

	BarModel.prototype.setTonality = function(tonality) {
		if (typeof tonality === "undefined") {
			tonality = '';
		}
		this.tonality = tonality;
	};

	BarModel.prototype.getTonality = function() {
		return this.tonality;
	};

	BarModel.prototype.setLabel = function(label) {
		if (typeof label === "undefined") {
			label = '';
		}
		this.label = label;
	};

	BarModel.prototype.getLabel = function() {
		return this.label;
	};

	BarModel.prototype.setSublabel = function(sublabel) {
		if (typeof sublabel === "undefined") {
			sublabel = '';
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
	/**
	 * @param  {boolean} unfolding , if true it means we are unfolding so we want to remove endings, labels..etc., if false, is pure cloning
	 * @return {BarModel}
	 */
	BarModel.prototype.clone = function(unfolding) {
		var newBar = new BarModel(this);
		if (unfolding)
		{
			newBar.removeEnding();
		}
		return newBar;
	};

	return BarModel;
});