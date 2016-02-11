define(function(){
	/**
	 * [ChordsCursorUpdater description]
	 * @param {SongModel} song                  
	 * @param {Cursor} chordsCursor          
	 * @param {String} chordSpaceManagerType	values: 'ALL_CHORDS_SPACES' or 'ONLY_CHORDS' see ChordSpaceManager params (should have the same value as chordSpaceManager)
	 */
	function ChordsCursorUpdater(song, chordsCursor, chordSpaceManagerType){
		this.chordMng = song.getComponent('chords');
		this.chordsCursor = chordsCursor;
		this.prevIChord = 0;
		this.chordSpaceManagerType = chordSpaceManagerType || 'ALL_CHORD_SPACES';
		this.beatsIndex = this.chordMng.getBeatsBasedChordIndexes(song);
	};
	ChordsCursorUpdater.prototype._getChordIndex = function(time) {
		var onlyChords = this.chordSpaceManagerType === 'ONLY_CHORDS';
		for (var i = 0; i < this.beatsIndex.length; i++) {
			if (this.beatsIndex[i] > time){
				return onlyChords ? i -1 : this.beatsIndex[i - 1] - 1;
			}
		}
		return onlyChords ? this.beatsIndex.length - 1 : this.beatsIndex[this.beatsIndex.length - 1] - 1;
		
	};
	/**
	 * Interface function used in AudioAnimation. Updates chords cursor when playing
	 * @param  {AudioController} audio 
	 */
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