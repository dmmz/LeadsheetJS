define(function(){
	
	/**
	 * Makes cursor notes move while playing
	 * @param {SongModel} song   song is a dependency and not 'NoteManager', because there are cases in which we change entirely the 
	 *                           note manager, so we need to reference to song in order to continue it making work
	 * @param {CursorModel} notesCursor 
	 */
	function NotesCursorUpdater(song, notesCursor){
		this.song = song;
		this.notesCursor = notesCursor;
		this.prevINote = 0;
	};

	NotesCursorUpdater.prototype.update = function(audio) {
		var currTime = audio.getCurrentTime();
		var noteMng = this.song.getComponent('notes');
		var iNote = noteMng.getPrevIndexNoteByBeat(currTime / audio.beatDuration + 1);
		if (iNote != this.prevINote && iNote < this.notesCursor.getListLength()){
			this.notesCursor.setPos(iNote);	
			this.prevINote = iNote;
		}	
	};
	return NotesCursorUpdater;
});