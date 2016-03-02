define([
	'utils/NoteUtils'
	], function(NoteUtils) {
	function PitchClass(pitch){
		this.name = pitch.substring(0,1);
		this.accidental = pitch.substring(1,pitch.lengh);
		this.semitoneCount = NoteUtils.pitch2Number(pitch);
	}

	PitchClass.prototype.toString = function() {
		return this.name + this.accidental;
	}
	/**
	 * [_semitonesDiff description]
	 * @param  {PitchClass} pc2       pitch class to compare to
	 * @param  {[type]} direction [description]
	 * @return {[type]}           [description]
	 */
	PitchClass.prototype._semitonesDiff = function(pc2, direction) {
		
		var pc2semitoneCount = pc2.semitoneCount;

		if (this.semitoneCount != pc2.semitoneCount && 	
			(this.semitoneCount > pc2.semitoneCount) == (direction > 0)){  // ...and both are true or both are false
			pc2semitoneCount += 12 * direction; // in case both are false we direction is -1, otherwise direction is 1
		}
		return pc2semitoneCount - this.semitoneCount;
	};
	PitchClass.prototype._sumNaturalCount = function(name, intervalType, direction) {
		direction = direction || 1;
		var naturalCount = NoteUtils.NATURAL_PITCHES[name];
		var naturalCountEnd = naturalCount + (intervalType - 1) * direction;
		var octaveDiff = (naturalCountEnd < 0 || naturalCountEnd >= 7) ? direction : 0;
		naturalCount = naturalCountEnd % 7; // -1 because interval type includes starting position. e.g. C - E is a 3rd, whereas C + 2 = E
		if (naturalCount < 0 ) naturalCount += 7;
		return {
			pitchClassName: NoteUtils.PITCH_CLASSES[naturalCount],
			octaveDiff : octaveDiff
		};
	};
	PitchClass.prototype.sharp = function(semitonesToMove) {
		for (var i = 0; i < NoteUtils.ACCIDENTALS.length; i++) {
			if (this.accidental == NoteUtils.ACCIDENTALS[i]){
				this.accidental = NoteUtils.ACCIDENTALS[i + semitonesToMove];
				return;
			}
		}
	};
	PitchClass.prototype.flat = function(semitonesToMove) {
		for (var i = NoteUtils.ACCIDENTALS.length - 1; i >= 0; i--) {
			if (this.accidental == NoteUtils.ACCIDENTALS[i]){
				this.accidental = NoteUtils.ACCIDENTALS[i - semitonesToMove];
				return;
			}
		}
	};
	PitchClass.prototype.transposeBy = function(interval, direction, getOctave) {
		direction = direction || 1;
		var r = this._sumNaturalCount(this.name, interval.type, direction);

		var newPitchName = r.pitchClassName;
		var newPitch = new PitchClass(newPitchName);
		var semitonesDiff = this._semitonesDiff(newPitch, direction);

		var semitonesToMove = interval.semitones - Math.abs(semitonesDiff);
		var action = (semitonesToMove > 0) == (direction > 0) ? 'sharp' : 'flat';
		newPitch[action](Math.abs(semitonesToMove));
		
		if (newPitch.accidental === undefined){
			throw "impossible transposition from "+this.name+", "+direction+" "+interval.name;
		}
		return getOctave ? {
			newPitch: newPitch,
			octaveDiff: r.octaveDiff
		} : newPitch;
	};
	return PitchClass;
});