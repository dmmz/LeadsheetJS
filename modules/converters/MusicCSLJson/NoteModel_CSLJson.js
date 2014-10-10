define([], function() {
	function NoteModel_CSLJson(MusicCSLJSON) {

	};
	
	NoteModel_CSLJson.prototype.importFromMusicCSLJSON = function(noteStruct, noteModel) {
		noteModel.numPitches = noteStruct.keys.length;

		var duration = noteStruct.duration;
		if ((duration.indexOf("r") != -1)) {
			noteModel.duration = duration.substring(0, duration.length - 1);
			noteModel.isRest = true;
		} else {
			noteModel.duration = duration;
			noteModel.isRest = false;
		}

		if (noteStruct.keys.length > 1) {
			noteStruct.keys = NoteUtils.sortPitches(noteStruct.keys);
		}

		var parsedNote;
		for (var i = 0; i < noteStruct.keys.length; i++) {
			parsedNote = string2Obj(noteStruct.keys[i]);

			noteModel.pitchClass[i] = parsedNote.pitchClass;
			noteModel.accidental[i] = parsedNote.accidental;
			noteModel.octave[i] = parsedNote.octave;
		}

		noteModel.setDot(noteStruct.dot);
		noteModel.setTie(noteStruct.tie);
		noteModel.setTuplet(noteStruct.tuplet, noteStruct.time_modification);

		if (typeof noteStruct.num_measure !== "undefined") {
			noteModel.setMeasure(noteStruct.num_measure);
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
	NoteModel_CSLJson.prototype.exportToMusicCSLJSON = function(noteModel, complete, withNumMeasure) {
		if (complete === undefined) complete = true;
		if (withNumMeasure === undefined) withNumMeasure = false;

		var noteObj = {};

		noteObj.keys = [];
		for (var i = 0; i < noteModel.numPitches; i++) {
			noteObj.keys.push(noteModel.getPitch(i));
		}
		noteObj.duration = noteModel.duration;
		//important only set property if not null, 
		if (noteModel.dot != null) noteObj.dot = noteModel.dot;
		if (noteModel.tie != null && complete) noteObj.tie = noteModel.tie;
		if (noteModel.tuplet != null && complete) noteObj.tuplet = noteModel.tuplet;
		if (noteModel.time_modification != null && complete) noteObj.time_modification = noteModel.time_modification;
		if (noteModel.isRest) noteObj.duration += "r";

		if (noteModel.measure != null && withNumMeasure) noteObj.num_measure = noteModel.measure;



		return noteObj;
	};
	
	return NoteModel_CSLJson;
});