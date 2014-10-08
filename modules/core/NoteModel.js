define(['utils/NoteUtils'], function(NoteUtils) {

	/**
	 * [NoteModel description]
	 * @see [description]
	 * @param {Object, String, null} param : depending on the type it will create an empty note, a rest note or a pitch note
	 */
	function NoteModel(param) {

		this.pitchClass = []; // Note c, b
		this.octave = []; // octave from 0 to 8
		this.accidental = []; // b or #
		this.dot = 0; // 0,1,2
		this.tie = undefined; // contain "start", "stop", "stop_start"
		this.tuplet = undefined
		this.timeModification;

		if (typeof param == "string") { //duration "h","d","8"
			this.populateFromRestNote(param);
			return;
		} else if (param == null) {
			return;
		} else {
			this.populateFromStruct(param);
		}
	}
	/**
	 * @param  {Number} i
	 * @return {String} pitch. e.g.: "A#/5", "Bb/4"
	 */
	NoteModel.prototype.getPitch = function(i) {
		i = i || 0;
		return this.pitchClass[i] + this.accidental[i] + "/" + this.octave[i];
	};
	/**
	 * @param {Number} dots
	 */
	NoteModel.prototype.setDot = function(dots) {
		if (!dots) return;

		var nDots = Number(dots);
		if (isNaN(nDots) || nDots < 0 || nDots > 2) throw "not valid number of dots";
		this.dot = nDots;
	};

	NoteModel.prototype.getDot = function() {
		return this.dot;
	};

	/**
	 * @param {String} tieType "start","stop" or "stop_start"
	 */
	NoteModel.prototype.setTie = function(tieType) {
		if (!tieType) return;

		var arr = ["start", "stop", "stop_start"];
		if (arr.indexOf(tieType) == -1) throw "not valid tie type " + tieType;

		if (!this.tie) this.tie = tieType;
		else if (tieType != this.tie) this.tie = "stop_start";
	};

	NoteModel.prototype.getTie = function() {
		return this.tie;
	};

	/* if both parameters are null or undefined, function does not do anything, this happens on constructor
	 *
	 * @param {[type]} typeTuplet       "start","stop","middle", middle does not set the value this.tuplet
	 * @param {[type]} timeModification if empty set to "3/2"
	 * examples:
	 *		setTuplet(), setTuplet(undefined)  won't do anything
	 *		setTuplet("middle")	will set only this.timeModification
	 */
	NoteModel.prototype.setTuplet = function(typeTuplet, timeModification) {
		if (!typeTuplet && !timeModification) return;

		var validTypes = ["start", "stop", "stop_start", "middle"];
		if (typeTuplet && validTypes.indexOf(typeTuplet) == -1) {
			throw "not valid typeTuplet " + typeTuplet;
		}
		this.timeModification = timeModification || "3/2";

		//we know typeTuple is a valid type, just check that is not middel
		if (typeTuplet != "middle") this.tuplet = typeTuplet;
	};
	/**
	 * @return {"start","stop","stop_start","middle"}
	 */
	NoteModel.prototype.getTuplet = function() {
		if (this.timeModification && !this.tuplet) return "middle";
		else return this.tuplet;
	};

	NoteModel.prototype.getTimeModif = function() {
		return this.timeModification || null;
	};

	NoteModel.prototype.removeTuplet = function() {
		this.timeModification = null;
		this.tuplet = null;
	};

	NoteModel.prototype.setMeasure = function(numMeasure) {
		if (!numMeasure || isNaN(numMeasure)) throw "invalid numMeasure";
		this.measure = numMeasure;
	};

	NoteModel.prototype.getMeasure = function() {
		return this.measure;
	};

	/**
	 * @param {Boolean} bool
	 */
	NoteModel.prototype.setRest = function(bool) {
		if (typeof bool === "undefined") bool = true;
		this.isRest = bool;
		//if (this.isRest) this.setRestPitch(); // maybe use it in module viewer, because it's only for vexflow viewer
		this.setAccidental("");
	};

	/**	
	 * @param {String} acc ["","#","b","n"]
	 * @param {Number} i   default 0
	 */
	NoteModel.prototype.setAccidental = function(acc, i) {
		var validAccidentals = ["", "#", "b", "n"];
		if (validAccidentals.indexOf(acc) == -1) throw "invalid accidental";
		i = i || 0;
		this.accidental[i] = acc;
	};
	NoteModel.prototype.getAccidental = function(i) {
		i = i || 0;
		return this.accidental[i];
	};
	NoteModel.prototype.removeAccidental = function(i) {
		this.setAccidental("", i);
	};

	NoteModel.prototype.getNumPitches = function() {
		return this.pitchClass.length;
	};
	/**
	 * returns duration in number of beats. where 1.0 is a quarter note, regardless of the time signature (6/8, 4/4...)
	 * @param  {Number} numBeats optional: useful for whole rests, their duration depends on number of beats of the bar, 
	 * in that case it's sent as parameter
	 * @return {Float}          
	 */
	NoteModel.prototype.getDuration = function(numBeats) {
		switch (this.duration) {
			case "w":
				//problem for whole rest can't distinguish if duration is 4 or more on time sigs >= 5/4. For those time sigs, dur=4
				if (!this.isRest) dur = 4;
				else dur = (typeof numBeats === "undefined" || numBeats > 4) ? 4 : numBeats;
				break;
			case "h":
				dur = 2;
				break;
			case "q":
				dur = 1;
				break;
			case "8":
				dur = 0.5;
				break;
			case "16":
				dur = 0.25;
				break;
			case "32":
				dur = 0.125;
				break;
			case "64":
				dur = 0.0625;
				break;
		}

		if (this.timeModification != null) {
			var nums = this.timeModification.split("/");
			dur = dur * parseInt(nums[1], null) / parseInt(nums[0], null);
		}
		var durTmp = dur;
		for (var i = 0; i < this.dot; i++) {
			durTmp /= 2;
			dur += durTmp;
		}
		return dur;
	};
	/**
	 * [populateFromStruct description]
	 * @param  {[type]} noteStruct [description]
	 * @return {[type]}            [description]
	 */
	NoteModel.prototype.populateFromStruct = function(noteStruct) {
		this.numPitches = noteStruct.keys.length;

		var duration = noteStruct.duration;
		if ((duration.indexOf("r") != -1)) {
			this.duration = duration.substring(0, duration.length - 1);
			this.isRest = true;
		} else {
			this.duration = duration;
			this.isRest = false;
		}

		if (noteStruct.keys.length > 1) {
			noteStruct.keys = NoteUtils.sortPitches(noteStruct.keys);
		}

		var parsedNote;
		for (var i = 0; i < noteStruct.keys.length; i++) {
			parsedNote = string2Obj(noteStruct.keys[i]);

			this.pitchClass[i] = parsedNote.pitchClass;
			this.accidental[i] = parsedNote.accidental;
			this.octave[i] = parsedNote.octave;
		}

		this.setDot(noteStruct.dot);
		this.setTie(noteStruct.tie);
		this.setTuplet(noteStruct.tuplet, noteStruct.time_modification);

		if (typeof noteStruct.num_measure !== "undefined") {
			this.setMeasure(noteStruct.num_measure);
		}

		function string2Obj(strPitch) {
			var re = /[a-g|A-G](#{1,2}|b{1,2}|n)?\/\d/;
			if (!strPitch.match(re)) throw "Error creating pitch " + strPitch + ". Should be in de form [pitch][acc]/[octave]. e.g. Ab/4";

			var parts = strPitch.split("/");

			var pitchClass = parts[0].substr(0, 1).toUpperCase();
			var accidental = parts[0].substr(1, parts[0].length);
			var octave = parts[1];

			return {
				pitchClass: pitchClass,
				accidental: accidental,
				octave: octave
			};
		}
	};

	/**
	 * @param  {String} symbDuration "h","q","8","16"
	 */
	NoteModel.prototype.populateFromRestNote = function(symbDuration) {
		this.duration = symbDuration;
		this.isRest = true;
		this.numPitches = 1;
		this.setRest();
	};


	
	return NoteModel;
});