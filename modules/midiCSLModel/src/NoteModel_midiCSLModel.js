define([], function() {

	function NoteModel_midiCSLModel(option) {
		this.currentTime = (typeof option !== "undefined" && typeof(option.currentTime) !== "undefined") ? option.currentTime : 0.0; // currentTime in beat
		this.duration = (typeof option !== "undefined" && typeof(option.duration) !== "undefined") ? option.duration : 0.0; // duration in beat
		this.type = (typeof option !== "undefined" && typeof(option.type) !== "undefined") ? option.type : undefined; // type is melody or chord
		this.midiNote = (typeof option !== "undefined" && typeof(option.midiNote) !== "undefined") ? option.midiNote : [];
	};

	NoteModel_midiCSLModel.prototype.getCurrentTime = function() {
		return this.currentTime;
	};

	NoteModel_midiCSLModel.prototype.setCurrentTime = function(currentTime) {
		if (typeof currentTime === "undefined" || isNaN(currentTime) || currentTime < 0) {
			throw 'NoteModel_midiCSLModel - setCurrentTime - currentTime must be a positive float ' + currentTime;
		}
		this.currentTime = currentTime;
	};

	NoteModel_midiCSLModel.prototype.getDuration = function() {
		return this.duration;
	};

	NoteModel_midiCSLModel.prototype.setDuration = function(duration) {
		if (typeof duration === "undefined" || isNaN(duration) || duration < 0) {
			throw 'NoteModel_midiCSLModel - setCurrentTime - duration must be a positive float ' + duration;
		}
		this.duration = duration;
	};

	NoteModel_midiCSLModel.prototype.getType = function() {
		return this.type;
	};

	NoteModel_midiCSLModel.prototype.setType = function(type) {
		if (typeof type === "undefined") {
			throw 'NoteModel_midiCSLModel - setType - type is undefined ' + type;
		}
		this.type = type;
	};

	NoteModel_midiCSLModel.prototype.getMidiNote = function() {
		return this.midiNote;
	};

	NoteModel_midiCSLModel.prototype.setMidiNote = function(midiNote) {
		if (typeof midiNote === "undefined") {
			throw 'NoteModel_midiCSLModel - setType - midiNote is undefined ' + midiNote;
		}
		this.midiNote = midiNote;
	};

	NoteModel_midiCSLModel.prototype.getTransposeMidiNote = function(semi_tons) {
		var midiNote = [];
		var computedMidiNote;
		if(this.midiNote !== "undefined"){
			for (var i = 0, c = this.midiNote.length; i < c; i++) {
				computedMidiNote = this.midiNote[i] + semi_tons;
				if (computedMidiNote >= 21 && computedMidiNote <= 108) {
					midiNote[i] = computedMidiNote;
				}
			}
		}
		return midiNote;
	};

	NoteModel_midiCSLModel.prototype.serialize = function() {
		//return JSON.stringify(this.currentTime + this.duration + this.type + this.midiNote);
		var NoteModel_midiCSLModel = {};
		NoteModel_midiCSLModel.currentTime = this.currentTime;
		NoteModel_midiCSLModel.duration = this.duration;
		NoteModel_midiCSLModel.type = this.type;
		NoteModel_midiCSLModel.midiNote = this.midiNote;
		return NoteModel_midiCSLModel;
	};

	NoteModel_midiCSLModel.prototype.clone = function() {
		return new NoteModel_midiCSLModel(this.serialize());
	};

	return NoteModel_midiCSLModel;
});