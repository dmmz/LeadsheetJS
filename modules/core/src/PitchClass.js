define([
	'utils/NoteUtils'
	], function(NoteUtils) {
	/**
	 * PitchClass useful to transpose bu interval (TODO: integrate in NoteModel ?)
	 * @param {String} pitch e.g.: "A", "A#"
	 */
	function PitchClass(pitch){
		this.name = pitch.substring(0,1); // "A","B"
		this.accidental = pitch.substring(1,pitch.lengh); //"#", "##"
		this.semitoneCount = NoteUtils.pitch2Number(pitch);
	}

	PitchClass.prototype.toString = function() {
		return this.name + this.accidental;
	}
	/**
	 * gets the semitone distances between current pitchClass and pc2
	 * @param  {PitchClass} pc2       pitch class to compare to
	 * @param  {Number} direction either 1 or -1
	 * @return {Number} semitones difference
	 */
	PitchClass.prototype._semitonesDiff = function(pc2, direction) {
		var pc2semitoneCount = pc2.semitoneCount;

		if (this.semitoneCount != pc2.semitoneCount && 	/*this.name != pc2.name &&*/ 
			(this.semitoneCount > pc2.semitoneCount) == (direction > 0)){ 
			pc2semitoneCount += 12 * direction; // in case both are false, direction is -1, otherwise direction is 1
		}
		return pc2semitoneCount - this.semitoneCount;
	};
	/**
	   return resulting natural pitch of adding interval, e.g. A + perfectFourth, returns D and octaveDiff 1
	 * @param  {String} name         pitch name e.g. "A","B","C"...etc.
	 * @param  {Number} intervalType natural interval. e.g. 3 for third, regardless if it is major, minor or augmented
	 * @param  {Number} direction    either 1 or -1
	 * @return {Object}              {pitchClassName: "D", octaveDiff: 1}
	 */
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
	/**
	 * sets accidental to a new pitch witch has no accidental dpending on semitones to move. 
	 * @param {number} semitonesToMove e.g. if semitonesToMove = 2, this.accidental is set to "##"
	 */
	PitchClass.prototype._setAccidental = function(semitonesToMove) {
		this.accidental = NoteUtils.ACCIDENTALS[2 + semitonesToMove]; // position 2 is where empty accidental is, in this point, we will always start form empty accidental
	};
	

	/**
	 * @param  {Interval} interval  object representing interval to move, e.g. perfectFifth
	 * @param  {Number} direction either 1 or -1
	 * @param  {Boolean} getOctave if true, we return octave also
	 * @return {String|Object}           (depending on getOctave)
	 */
	PitchClass.prototype.transposeBy = function(interval, direction, getOctave) {
		direction = direction || 1;

		//to avoid errors we substitute
		if (this.accidental.length == 2){
			if (this.accidental == "##")		this.name = this._sumNaturalCount(this.name, 2, 1).pitchClassName;
			if (this.accidental == "bb")		this.name = this._sumNaturalCount(this.name, 2, -1).pitchClassName;
			this.accidental = "";
		}

		var r = this._sumNaturalCount(this.name, interval.type, direction);
		var newPitch = new PitchClass(r.pitchClassName),
			octaveDiff = r.octaveDiff;
		var	semitonesDiff = this._semitonesDiff(newPitch, direction);
		var semitonesToMove = interval.semitones - Math.abs(semitonesDiff);
		newPitch._setAccidental(semitonesToMove * direction);

		// if accidental is undefined it means it should be a bbb or ###, we find equivalent. e.g : F### ==> G#
		if (newPitch.accidental === undefined){
			newPitch._setAccidental(semitonesToMove * direction + 2 * direction * -1);
			var equivalentPitch = newPitch._sumNaturalCount(newPitch.name, 2, direction ); // moving a second
			newPitch.name = equivalentPitch.pitchClassName;
			//  case in which we have to change octave, 
			//	e.g. G## + augemented third -> B### which would be switched to  C#, but in that case we are changing octave, so take it into account
			octaveDiff  += equivalentPitch.octaveDiff;
				
		}
		if (newPitch.accidental === undefined){
			newPitch._setAccidental(semitonesToMove * direction + 4 * direction * -1);
			var equivalentPitch = newPitch._sumNaturalCount(newPitch.name, 2, direction ); // moving a second
			newPitch.name = equivalentPitch.pitchClassName;
			//  case in which we have to change octave, 
			//	e.g. G## + augemented third -> B### which would be switched to  C#, but in that case we are changing octave, so take it into account
			octaveDiff  += equivalentPitch.octaveDiff;
				
		}

		return getOctave ? {
			newPitch: newPitch,
			octaveDiff: octaveDiff
		} : newPitch;
	};
	return PitchClass;
});