define(function(){
	/**
	 * Makes cursor notes move while playing
	 * @param {NoteManager} noteMng     
	 * @param {Cursor} notesCursor 
	 */
	function ChordsCursorUpdater(song, chordsCursor){
		this.chordMng = song.getComponent('chords');
		this.chordsCursor = chordsCursor;
		this.prevIChord = 0;
		this.beatsIndex = this.chordMng.getBeatsBasedChordIndexes(song);
	};
	ChordsCursorUpdater.prototype._getChordIndex = function(time) {
		for (var i = 0; i < this.beatsIndex.length; i++) {
			if (this.beatsIndex[i] > time){
				return	this.beatsIndex[i - 1] - 1;
			}
		}
		return this.beatsIndex[this.beatsIndex.length - 1] - 1;
		
	};

	ChordsCursorUpdater.prototype.update = function(audio) {
		var currTime = audio.getCurrentTime();
		var iChord = this._getChordIndex(currTime / audio.beatDuration + 1);
		if (iChord != this.prevIChord){
			this.chordsCursor.setPos(iChord);
			this.prevIChord = iChord;
		}	
	};
	return ChordsCursorUpdater;
});