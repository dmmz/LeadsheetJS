define([], function() {
	function NoteModel_CSLJson_CSLJson(MusicCSLJSON) {

	};
	
	NoteModel_CSLJson.prototype.musicCSLJson2SongModel = function(noteStruct) {
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
			if (!strPitch.match(re)) throw "Error creating pitch " + strPitch + ". Should be in the form [pitch][acc]/[octave]. e.g. Ab/4";

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
	NoteModel_CSLJson.prototype.songModel2MusicCSLJson = function(songModel, complete, withNumMeasure) {
		if (complete === undefined) complete = true;
		if (withNumMeasure === undefined) withNumMeasure = false;

		var noteObj = {};

		noteObj.keys = [];
		for (var i = 0; i < this.numPitches; i++) {
			noteObj.keys.push(this.getPitch(i));
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
	
	return NoteModel_CSLJson;
});