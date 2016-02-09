define(function(){
	/**
	 * Makes cursor notes move while playing
	 * @param {NoteManager} noteMng     
	 * @param {Cursor} notesCursor 
	 */
	function NotesCursorUpdater(noteMng, notesCursor){
		this.noteMng = noteMng;
		this.notesCursor = notesCursor;
		this.prevINote = 0;
	};
	NotesCursorUpdater.prototype.update = function(audio) {
		var currTime = audio.getCurrentTime();
		var iNote = this.noteMng.getPrevIndexNoteByBeat(currTime / audio.beatDuration + 1);
		if (iNote != this.prevINote && iNote < this.notesCursor.getListLength()){
			this.notesCursor.setPos(iNote);	
			this.prevINote = iNote;
		}	
	};
	return NotesCursorUpdater;
});