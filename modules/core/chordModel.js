define(['utils/NoteUtils'], function(NoteUtils) {
	function ChordModel(param) {
		this.note = (typeof param !== "undefined" && param.note) ? param.note : "";
		this.chordType = (typeof param !== "undefined" && param.chordType) ? param.chordType : "";
		this.base = (typeof param !== "undefined" && param.base) ? param.base : {}; // base is a chordModel which represent a base note
		this.parenthesis = (typeof param !== "undefined" && typeof param.parenthesis !== "undefined") ? param.parenthesis : false;
		this.beat = (typeof param !== "undefined" && typeof param.beat !== "undefined") ? param.beat : 1;
		this.barNumber = (typeof param !== "undefined" && typeof param.barNumber !== "undefined") ? param.barNumber : 0;
		this.chordSymbolList = this.getChordSymbolList();
	}

	/* Basic getter setter */
	ChordModel.prototype.getNote = function() {
		return this.note;
	}
	ChordModel.prototype.setNote = function(note) {
		if (typeof note === "undefined") {
			throw 'Undefined note';
		}
		this.note = note;
	}

	ChordModel.prototype.getChordType = function() {
		return this.chordType;
	}

	ChordModel.prototype.setChordType = function(chordType) {
		if (typeof chordType !== "undefined") {
			this.chordType = chordType;
			return true;
		}
		return false;
	}

	ChordModel.prototype.getBase = function() {
		function isEmpty(obj) {
			return Object.keys(obj).length === 0;
		}
		return (isEmpty(this.base)) ? false : this.base;
	}

	ChordModel.prototype.setBase = function(chordBase) {
		if (typeof chordBase !== "undefined" && chordBase instanceof ChordModel) {
			this.base = chordBase;
			return true;
		}
		return false;
	}

	ChordModel.prototype.getParenthesis = function() {
		return this.parenthesis;
	}
	ChordModel.prototype.setParenthesis = function(parenthesis) {
		if (typeof parenthesis !== "undefined") {
			this.parenthesis = parenthesis;
			return true;
		}
		return false;
	}

	ChordModel.prototype.getBeat = function() {
		return this.beat;
	}
	ChordModel.prototype.setBeat = function(beat) {
		if (typeof beat !== "undefined" && !isNaN(beat)) {
			this.beat = beat;
			return true;
		}
		return false;
	}

	ChordModel.prototype.getBarNumber = function() {
		return this.barNumber;
	}

	ChordModel.prototype.setBarNumber = function(barNumber) {
		if (typeof barNumber !== "undefined" && !isNaN(barNumber)) {
			this.barNumber = barNumber;
			return true;
		}
		return false;
	}
	/*End basic getter and setters*/


	ChordModel.prototype.isEmpty = function() {
		if( (typeof this.note === "undefined" || this.note == "") 
			&& (typeof this.chordType === "undefined" || this.chordType == "")){
			return true;
		}
		return false;
	}

	ChordModel.prototype.clone = function() {
		var chord = JSON.parse(JSON.stringify(this));
		return chord;
	}

	ChordModel.prototype.toString = function() {
		var base = this.getBase();
		var string = "";
		if(!this.isEmpty()){
			string = this.getNote() + " " + this.formatChordType(this.getChordType());
		}
		if (!this.isEmpty(base) && base.getNote() != "") {
			string += "/" + base.getNote() + " " + this.formatChordType(base.getChordType());
		}
		if (this.getParenthesis()) {
			string = '(' + string + ')';
		}
		return string;
	}

	ChordModel.prototype.toUnformatedString = function() {
		var base = this.getBase();
		if ((this.isEmpty(base))) {
			var string = this.getNote() + this.getChordType();
			if (this.getParenthesis()) {
				string = '(' + string + ')';
			}
			return string;
		} else {
			var string = this.getNote() + this.getChordType() + "/" + base.getNote() + base.getChordType();
			if (this.getParenthesis()) {
				string = '(' + string + ')';
			}
			return string;
		}
	}

	ChordModel.prototype.toUnformatedStringWithSpace = function() {
		var base = this.getBase();
		var string = this.getNote() + " " + this.getChordType();
		if ((this.isEmpty(base))) {
			if (this.getParenthesis()) {
				string = '(' + string + ')';
			}
			return string;
		} else {
			string += "/" + base.getNote() + " " + base.getChordType();
			if (this.getParenthesis()) {
				string = '(' + string + ')';
			}
			return string;
		}
	}

	ChordModel.prototype.setChordFromString = function(stringChord) {

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
		}

		// Looking for base chord
		stringChord = stringChord.split('/');
		var note, chordType;

		var stringChordRoot = stringChord[0];

		if (stringChord.length >= 2) {

			var stringChordBase = stringChord[1];

			if ($.isEmptyObject(this.base)) {
				this.base = new ChordModel();
			}
			this.base.setChordFromString(stringChordBase);
		}
		// Set current chord note and chordtype
		stringChordRoot = stringChordRoot.replace(/\s/g, '');

		var r = validateSimpleChord(stringChordRoot);
		this.setNote(r.note);
		this.setChordType(r.chordType);

		//We set allMidiNotes to undefined because otherwise they won't be updated
		this.allMidiNotes = undefined;
		editor.update.call(editor);
		return !r.err;
	}


	ChordModel.prototype.getChordSymbolList = function() {
		function htmlDecode(value) {
			var div = document.createElement('div');
			div.innerHTML = value;
			return div.firstChild.nodeValue;
		}
		var maps = {
			"halfdim": "&#248;", //ø   //216 -> Ø
			//"maj7":"&#916;",//Δ
			"dim": "&#959;"
		}
		for (var prop in maps) {
			maps[prop] = htmlDecode(maps[prop]);
		}
		return maps;
	}

	/*
	 * The function transform a chordType String to symbols according chordSymbolList maps
	 * Example: halfdim become ø
	 */
	ChordModel.prototype.formatChordType = function(chordTypeName) {
		for (var props in this.chordSymbolList) {
			chordTypeName = chordTypeName.replace(props, this.chordSymbolList[props]);
		}
		return chordTypeName;
	}

	ChordModel.prototype.unformatChordType = function(chordTypeName) {
		for (var props in this.chordSymbolList) {
			chordTypeName = chordTypeName.replace(this.chordSymbolList[props], props);
		}
		return chordTypeName;
	}

	return ChordModel;
});