define([], function() {

	function MidiNoteModel(option) {
		this.currentTime = (typeof option !== "undefined" && typeof(option.currentTime) !== "undefined") ? option.currentTime : 0.0; // currentTime in beat
		this.duration = (typeof option !== "undefined" && typeof(option.duration) !== "undefined") ? option.duration : 0.0; // duration in beat
		this.type = (typeof option !== "undefined" && typeof(option.type) !== "undefined") ? option.type : undefined; // type is melody or chord
		this.midiNote = (typeof option !== "undefined" && typeof(option.midiNote) !== "undefined") ? option.midiNote : [];
	};

	MidiNoteModel.prototype.getCurrentTime = function() {
		return this.currentTime;
	};

	MidiNoteModel.prototype.setCurrentTime = function(currentTime) {
		if (typeof currentTime === "undefined" || isNaN(currentTime) || currentTime < 0) {
			throw 'MidiNoteModel - setCurrentTime - currentTime must be a positive float ' + currentTime;
		}
		this.currentTime = currentTime;
	};

	MidiNoteModel.prototype.getDuration = function() {
		return this.duration;
	};

	MidiNoteModel.prototype.setDuration = function(duration) {
		if (typeof duration === "undefined" || isNaN(duration) || duration < 0) {
			throw 'MidiNoteModel - setCurrentTime - duration must be a positive float ' + duration;
		}
		this.duration = duration;
	};

	MidiNoteModel.prototype.getType = function() {
		return this.type;
	};

	MidiNoteModel.prototype.setType = function(type) {
		if (typeof type === "undefined") {
			throw 'MidiNoteModel - setType - type is undefined ' + type;
		}
		this.type = type;
	};

	MidiNoteModel.prototype.getMidiNote = function() {
		return this.midiNote;
	};

	MidiNoteModel.prototype.setMidiNote = function(midiNote) {
		if (typeof midiNote === "undefined") {
			throw 'MidiNoteModel - setType - midiNote is undefined ' + midiNote;
		}
		this.midiNote = midiNote;
	};

	MidiNoteModel.prototype.getTransposeMidiNote = function(semi_tons) {
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

	MidiNoteModel.prototype.serialize = function() {
		//return JSON.stringify(this.currentTime + this.duration + this.type + this.midiNote);
		var midiNoteModel = {};
		midiNoteModel.currentTime = this.currentTime;
		midiNoteModel.duration = this.duration;
		midiNoteModel.type = this.type;
		midiNoteModel.midiNote = this.midiNote;
		return midiNoteModel;
	};

	MidiNoteModel.prototype.clone = function() {
		return new MidiNoteModel(this.serialize());
	};

	return MidiNoteModel;
});