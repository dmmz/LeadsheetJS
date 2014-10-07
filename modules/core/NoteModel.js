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

		if (typeof param == "string") { //duration "h","d","8"
			this.populateFromRestNote();
			return;
		} else if (param == null) {
			return;
		} else {
			this.populateFromStruct(param);
		}
	}

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
			noteStruct.keys = NoteTools.sortPitches(noteStruct.keys);
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