define(['modules/core/src/NoteModel', 'utils/NoteUtils'], function(NoteModel, NoteUtils) {
	var NoteModel_CSLJson = {};

	NoteModel_CSLJson.importFromMusicCSLJSON = function(noteStruct, noteModel) {

		var duration = noteStruct.duration;
		if ((duration.indexOf("r") != -1)) {
			noteModel.duration = duration.substring(0, duration.length - 1);
			noteModel.isRest = true;
			noteModel.barDuration = false; // when there is only a whole note in the bar, its duration will depend on bar's duration. Initially is false, in SongModel_CSLJson it can be modified
		} else {
			noteModel.duration = duration;
			noteModel.isRest = false;
		}

		
		if (noteStruct.keys.length > 1) {
			noteStruct.keys = NoteUtils.sortPitches(noteStruct.keys);
		}

		var parsedNote;
		for (var i = 0, c = noteStruct.keys.length; i < c; i++) {
			parsedNote = string2Obj(noteStruct.keys[i]);

			noteModel.pitchClass[i] = parsedNote.pitchClass;
			noteModel.accidental[i] = parsedNote.accidental;
			noteModel.octave[i] = parsedNote.octave;
		}

		noteModel.setDot(noteStruct.dot);
		noteModel.setTie(noteStruct.tie);
		noteModel.setTuplet(noteStruct.tuplet, noteStruct.time_modification);

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

	NoteModel_CSLJson.exportToMusicCSLJSON = function(note, complete, withNumMeasure) {
		if (!note){
			throw "note sent is not correct";
		}
		if (complete === undefined) complete = true;
		if (withNumMeasure === undefined) withNumMeasure = false;

		var noteObj = {};
		noteObj.keys = [];
		for (var i = 0, c = note.getNumPitches(); i < c; i++) {
			noteObj.keys.push(note.getPitch(i));
		}
		noteObj.duration = note.duration;
		//important only set property if not null, 
		if (note.dot != null) noteObj.dot = note.dot;
		if (note.tie != null && complete) noteObj.tie = note.tie;
		if (note.tuplet != null && complete) noteObj.tuplet = note.tuplet;
		if (note.timeModification != null && complete) noteObj.time_modification = note.timeModification;
		if (note.isRest) noteObj.duration += "r";

		if (note.measure != null && withNumMeasure) noteObj.num_measure = note.measure;
		return noteObj;
	};

	return NoteModel_CSLJson;
});