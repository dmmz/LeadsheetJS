define(['modules/core/src/PitchClass'],function(PitchClass){
	function Note(name, accidental, octave){
		this.pitchClass = new PitchClass(name,accidental);
		this.octave = Number(octave);
	};
	Note.prototype.transposeBy = function(interval, direction) {
		var r = this.pitchClass.transposeBy(interval, direction, true);
		
		this.pitchClass = r.newPitch;
		this.octave += r.octaveDiff;

	};
	Note.prototype.toString = function() {
		return this.pitchClass.toString() + "/" + this.octave;
	};
	return Note;
});