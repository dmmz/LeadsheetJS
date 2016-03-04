define(function(){
	/**
	 * when converting notes from socre2play or for play2score (see NoteManagerModel), this object is useful for checking accidnetal that appear in each bar
	 * accidentals found in a measure will influence other notes with same pitch class and octave
	 */
	function BarAccidentals(){
		this.list = {};
	}

	BarAccidentals.prototype.updateAccidentals = function(note){
		var accidental = note.getAccidental();
		if (accidental){
			var octaveNote = note.getPitchClass() + note.getOctave();
			this.list[octaveNote] = accidental;
			return accidental;
		}
		return false;
	};
	BarAccidentals.prototype.getAccidental = function(note){
		return this.list[note.getPitchClass() + note.getOctave()];
	};
	BarAccidentals.prototype.reset = function(){
		for (var acc in this.list) delete this.list[acc];
	};
	return BarAccidentals;

});