define(['modules/core/src/PitchClass'],function(PitchClass){
	/**
	 * extends (by composition) PitchClass adding octave
	 * @param {String} name       
	 * @param {Strign} accidental 
	 * @param {Number} octave     
	 */
	function Note(name, accidental, octave){
		this.pitchClass = new PitchClass(name + accidental);
		this.octave = Number(octave);
	};
	/**
	 * sets pitchClass and octave of transposed note
	 * @param  {Interval} interval  object representing interval to move, e.g. perfectFifth
	 * @param  {Number} direction either 1 or -1
	 */
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