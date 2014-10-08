define(['utils/NoteUtils'], function(NoteUtils) {
	/**
	 * Chord Model is a core model representing a leadsheet chord
	 * @param {} param is an object of parameters
	 * param accept : {
	 * 		note: "C",				// note is a string indicating the root pitch of chord, it also can be % or %% (for repeat) or NC for No Chords
	 * 		chordType: "7",			// chordtype is a string indicating a chordtype
	 * 		base: {ChordModel},		// base is a chordModel which represent a base note
	 * 		parenthesis: false,		// booalean indicating if there are parenthesis or not
	 * 		beat: 1, 				// startbeat in the current measure (start at 1)
	 * 		barNumber: 0 			// start bar number (start at 0)
	 * }
	 */
	function ChordModel(param) {
		this.note = (typeof param !== "undefined" && param.note) ? param.note : "";
		this.chordType = (typeof param !== "undefined" && param.chordType) ? param.chordType : "";
		this.base = (typeof param !== "undefined" && param.base) ? param.base : {};
		this.parenthesis = (typeof param !== "undefined" && typeof param.parenthesis !== "undefined") ? param.parenthesis : false;
		this.beat = (typeof param !== "undefined" && typeof param.beat !== "undefined") ? param.beat : 1;
		this.barNumber = (typeof param !== "undefined" && typeof param.barNumber !== "undefined") ? param.barNumber : 0;
		this.chordSymbolList = this.getChordSymbolList();
	};

	/* Basic getter setter */
	ChordModel.prototype.getNote = function() {
		return this.note;
	};
	ChordModel.prototype.setNote = function(note) {
		if (typeof note === "undefined") {
			throw 'Undefined note';
		}
		this.note = note;
	};

	ChordModel.prototype.getChordType = function() {
		return this.chordType;
	};

	ChordModel.prototype.setChordType = function(chordType) {
		if (typeof chordType === "undefined") {
			throw 'Undefined Chordtype';
		}
		this.chordType = chordType;
	};

	ChordModel.prototype.getBase = function() {
		return this.base;
	};

	ChordModel.prototype.setBase = function(chordBase) {
		if ((typeof chordBase === "undefined" || !(chordBase instanceof ChordModel)) && chordBase !== "") {
			throw "Base don't have the correct ChordModel type";
		}
		this.base = chordBase;
	};

	ChordModel.prototype.getParenthesis = function() {
		return this.parenthesis;
	};
	ChordModel.prototype.setParenthesis = function(parenthesis) {
		if (typeof parenthesis === "undefined") {
			throw "Parenthesis have not been set";
		}
		this.parenthesis = !!parenthesis;
	};

	ChordModel.prototype.getBeat = function() {
		return this.beat;
	};

	ChordModel.prototype.setBeat = function(beat) {
		if (typeof beat !== "undefined" && !isNaN(beat)) {
			this.beat = beat;
			return true;
		}
		return false;
	};

	ChordModel.prototype.getBarNumber = function() {
		return this.barNumber;
	}

	ChordModel.prototype.setBarNumber = function(barNumber) {
		if (typeof barNumber !== "undefined" && !isNaN(barNumber)) {
			this.barNumber = barNumber;
			return true;
		}
		return false;
	};
	/*End basic getter and setters*/


	ChordModel.prototype.isEmpty = function() {
		if (typeof this.note === "undefined" || this.note == "") {
			return true;
		}
		return false;
	}

	ChordModel.prototype.clone = function() {
		var chord = JSON.parse(JSON.stringify(this));
		return chord;
	};

	/**
	 *
	 * @param  {string}  delimiter  It's the separator between note and chordtype, by default it's a space : C M7
	 * @param  {Boolean} isFormated If true some chordsd are formatted with symbiols like Δ or ø
	 * @return {string}             [description]
	 */
	ChordModel.prototype.toString = function(delimiter, isFormated) {
		if (typeof delimiter === "undefined") {
			delimiter = "";
		}
		if (typeof isFormated === "undefined") {
			isFormated = true;
		}

		var chordType = this.getChordType();
		if (isFormated) {
			chordType = this.formatChordType(chordType);
		}

		var string = "";
		if (!this.isEmpty()) {
			string = this.getNote() + delimiter + chordType;
		}

		var base = this.getBase();
		if (base instanceof ChordModel && base.getNote() != "") {
			var baseChordType = base.getChordType();
			if (isFormated) {
				baseChordType = this.formatChordType(baseChordType);
			}
			string += "/" + base.getNote() + delimiter + baseChordType;
		}

		if (this.getParenthesis()) {
			string = '(' + string + ')';
		}

		return string;
	};

	ChordModel.prototype.setChordFromString = function(stringChord) {
		// Looking for base chord
		stringChord = stringChord.split('/');
		var note, chordType;

		var stringChordRoot = stringChord[0];

		if (stringChord.length >= 2) {

			var stringChordBase = stringChord[1];

			if (this.base instanceof ChordModel === false) {
				this.base = new ChordModel();
			}
			this.base.setChordFromString(stringChordBase);
		}
		// Set current chord note and chordtype
		stringChordRoot = stringChordRoot.replace(/\s/g, '');

		//var r = validateSimpleChord(stringChordRoot);
		var pos;
		if (stringChordRoot.charAt(1) == "b" || stringChordRoot.charAt(1) == "#" || stringChordRoot.charAt(1) == "%")
			pos = 2;
		else if (stringChordRoot == "NC")
			pos = stringChordRoot.length;
		else
			pos = 1;

		var pitchClass = stringChordRoot.substring(0, pos);
		var chordType = stringChordRoot.substring(pos, stringChordRoot.length);
		this.setNote(pitchClass);
		this.setChordType(chordType);

		/*
		function validateSimpleChord(cChord) {
			var pitchClasses = ["C", "C#", "Cb", "D", "D#", "Db", "E", "E#", "Eb", "F", "F#", "Fb", "G", "G#", "Gb", "A", "A#", "Ab", "B", "B#", "Bb", "%", "%%", "NC"];

			var chordTypes = NoteTools.getCollection('chordtype');
			var nChord = jQuery.trim(cChord);
			var pos;
			if (nChord.charAt(1) == "b" || nChord.charAt(1) == "#" || nChord.charAt(1) == "%")
				pos = 2;
			else if (nChord == "NC")
				pos = nChord.length;
			else
				pos = 1;

			var pitchClass = nChord.substring(0, pos);
			var chordType = nChord.substring(pos, nChord.length);

			if ((pitchClasses.indexOf(pitchClass) == -1 || chordTypes.indexOf(chordType) == -1) && cChord.length != 0) {
				//error            
				return {
					err: true,
					msg: "incorrect chord " + pitchClass + " " + chordType
				}
			} else return {
				note: pitchClass,
				chordType: chordType
			}
		};
*/
	};


	ChordModel.prototype.getChordSymbolList = function() {
		function htmlDecode(value) {
			var div = document.createElement('div');
			div.innerHTML = value;
			return div.firstChild.nodeValue;
		}
		var maps = {
			"halfdim": "&#248;", //ø   //216 -> Ø
			//"M7":"&#916;",//Δ
			"dim": "&#959;"
		}
		for (var prop in maps) {
			maps[prop] = htmlDecode(maps[prop]);
		}
		return maps;
	};

	/*
	 * The function transform a chordType String to symbols according chordSymbolList maps
	 * Example: halfdim become ø
	 */
	ChordModel.prototype.formatChordType = function(chordTypeName) {
		for (var props in this.chordSymbolList) {
			chordTypeName = chordTypeName.replace(props, this.chordSymbolList[props]);
		}
		return chordTypeName;
	};

	ChordModel.prototype.unformatChordType = function(chordTypeName) {
		for (var props in this.chordSymbolList) {
			chordTypeName = chordTypeName.replace(this.chordSymbolList[props], props);
		}
		return chordTypeName;
	};

	return ChordModel;
});