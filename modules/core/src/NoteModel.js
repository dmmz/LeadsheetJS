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
		this.duration = (param && param.duration) ? param.duration : undefined;
		this.isRest = (param && param.isRest) ? param.isRest : false;
		this.dot = (param && param.dot) ? param.dot : 0; // 0,1,2
		this.tie = (param && param.tie) ? param.tie : undefined; // contain "start", "stop", "stop_start"
		this.tuplet = (param && param.tuplet) ? param.tuplet : undefined;
		this.timeModification = (param && param.timeModification) ? param.timeModification : undefined;

		if (typeof this.tuplet !== "undefined") {
			this.setTuplet(this.tuplet, this.timeModification);
		}

		if (typeof param == "string") { //duration "h","d","8" or C#/4-8r
			this.setNoteFromString(param);
		} else if (typeof param !== "undefined" && typeof param.pitchList !== "undefined") {
			if (param.pitchList.length > 1) {
				param.pitchList = NoteUtils.sortPitches(param.pitchList);
			}
			for (var i = 0, c = param.pitchList.length; i < c; i++) {
				this.setNoteFromString(param.pitchList[i], i);
			}
		}
	}

	NoteModel.prototype.toString = function(string, index) {
		return this.pitchClass[0] + this.accidental[0] + this.octave[0];
	};

	NoteModel.prototype.setNoteFromString = function(string, index) {
		index = index || 0;
		var re = /[a-g|A-G](#{1,2}|b{1,2}|n)?(-[w|h|q|8|16|32|64])?\.{0,2}\/\d/;
		if (string.match(re)) {
			var parts = string.split("-");
			var partsPitch = parts[0].split("/");
			this.pitchClass[index] = partsPitch[0].substr(0, 1).toUpperCase();
			this.accidental[index] = partsPitch[0].substr(1, partsPitch[0].length);
			this.octave[index] = partsPitch[1];
			if (parts.length == 2) {
				var partsDuration = parts[1].split("/");

				// look if there is a dot
				var dotPosition = partsDuration[0].indexOf(".");
				if (dotPosition == -1) {
					this.duration = partsDuration[0];
				} else {
					this.duration = partsDuration[0].split('.')[0];
					this.dot = partsDuration[0].length - dotPosition;
				}
			}

		} else {
			re = /[w|h|q|8|16|32|64](r)?/;
			if (!string.match(re)) {
				throw "Creating pitch " + string + ". Should be in de form [pitch][acc]/[octave]. e.g. Ab/4 or [duration] if you want a rest eg. '8'";
			}
			var restPosition = string.indexOf("r");
			if (restPosition == -1) {
				this.duration = string;
			} else {
				this.duration = string.substr(0, restPosition);
			}
			this.isRest = true;
		}
	};

	NoteModel.prototype.getNumPitches = function() {
		return this.pitchClass.length;
	};

	NoteModel.prototype.getPitchClass = function(i) {
		i = i || 0;
		return this.pitchClass[i];
	};

	NoteModel.prototype.getAccidental = function(i) {
		i = i || 0;
		return this.accidental[i];
	};
	NoteModel.prototype.getOctave = function(i) {
		i = i || 0;
		return this.octave[i];
	};

	/**
	 * @param  {Number} index
	 * @return {String} pitch. e.g.: "A#/5", "Bb/4"
	 */
	NoteModel.prototype.getPitch = function(index) {
		// check if number, check if  < numPitches
		index = index || 0;

		var accidental = '';
		if (typeof this.accidental[index] !== "undefined") {
			accidental = this.accidental[index];
		}

		var octave = '';
		if (typeof this.octave[index] !== "undefined") {
			octave = '/' + this.octave[index];
		}
		return this.pitchClass[index] + accidental + octave;
	};

	/**
	 * @param {Number} dots
	 */
	NoteModel.prototype.setDot = function(dots) {
		if (typeof dots === "undefined") {
			return;
		}
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

	NoteModel.prototype.removeTie = function(tieType) {
		if (this.tie != "stop_start") this.tie = null;
		else {
			if (tieType === undefined) throw "tieType not defined";
			this.tie = (tieType == "start") ? "stop" : "start";
		}
	};
	/**
	 * if tieType not specified, returns boolean if there is actually a tie (no matter which type)
	 * if tieType is specified checks in a 'soft' way, that means that for tie "stop_start", both isTie("start")
	 * and isTie("stop") will return true
	 *
	 * @param  {String}  tieType
	 * @return {Boolean}
	 */
	NoteModel.prototype.isTie = function(tieType) {
		if (!tieType) return this.tie != null;
		else return this.tie && this.tie.indexOf(tieType) != -1;
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
		//we know typeTuple is a valid type, just check that is not middle
		if (typeTuplet != "middle") this.tuplet = typeTuplet;
	};
	/**
	 * @return {"start","stop","stop_start","middle"}
	 */
	NoteModel.prototype.getTuplet = function() {
		if (this.timeModification && !this.tuplet) return "middle";
		else return this.tuplet;
	};

	NoteModel.prototype.getTimeModification = function() {
		return this.timeModification || null;
	};

	NoteModel.prototype.removeTuplet = function() {
		this.timeModification = null;
		this.tuplet = null;
	};
	/**
	 * if "type" is undefined, just checkes that is tuplet,
	 * if type is 'start' or 'stop' returns checks that tuplet is type
	 * @param  {String}  type  "start" , "stop" or undefined
	 * @return {Boolean}
	 */
	NoteModel.prototype.isTuplet = function(type) {
		return (!type) ? this.timeModification != null :
			this.timeModification != null && this.tuplet && this.tuplet.indexOf(type) != -1;
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
		var validAccidentals = ["", "#", "b", "n", "##", "bb"];
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
		var dur = 0.0;
		dur = NoteUtils.getBeatFromStringDuration(this.duration);
		if (dur === 4) {
			if (this.isRest) {
				dur = (typeof numBeats === "undefined" || numBeats > 4) ? 4 : numBeats;
			}
		}
		if (this.timeModification != null) {
			var nums = this.timeModification.split("/");
			dur = dur * parseInt(nums[1], null) / parseInt(nums[0], null);
		}
		var durTmp = dur;
		for (var i = 0, c = this.dot; i < c; i++) {
			durTmp /= 2;
			dur += durTmp;
		}
		return dur;
	};

	NoteModel.prototype.setDuration = function(dur) {
		if (typeof dur === "number"){
			dur = NoteUtils.getStringFromBeatDuration(dur);
		}
		this.duration = dur;
	};


	NoteModel.prototype.serialize = function(complete, withNumMeasure) {
		if (complete === undefined) complete = true;
		if (withNumMeasure === undefined) withNumMeasure = false;

		var noteObj = {};
		noteObj.pitchList = [];
		for (var i = 0, c = this.getNumPitches(); i < c; i++) {
			noteObj.pitchList.push(this.getPitch(i));
		}
		noteObj.duration = this.duration;
		//important only set property if not null, 
		if (this.dot != null) noteObj.dot = this.dot;
		if (this.tie != null && complete) noteObj.tie = this.tie;
		if (this.tuplet != null && complete) noteObj.tuplet = this.tuplet;
		if (this.time_modification != null && complete) noteObj.time_modification = this.time_modification;
		if (this.isRest) noteObj.duration += "r";

		if (this.measure != null && withNumMeasure) noteObj.num_measure = this.measure;

		return noteObj;
	};



	/**
	 * @param  {boolean} complete: if true, clones completely (case of copy/paste), if false,
	 *                             ommits ties and tuplets (case of addNote). If not defined, it's true
	 * @return {NoteModel}
	 */
	NoteModel.prototype.clone = function(complete) {
		return new NoteModel(this.serialize(complete));
	};

	return NoteModel;
});