define(['utils/NoteUtils'], function(NoteUtils){
	/**
	 * class iterates through notes but being aware of structure issues (like time or key signature changes)
	 * @param {SongBarsIterator} songIt  
	 * @param {NoteManagerModel} noteMng 
	 */
	function NotesIterator(songIt, noteMng){
		this.songIt = songIt;
		this.noteMng = noteMng;
		this._reset();

	};
	NotesIterator.prototype._reset = function() {
		this.index = 0;
		this.duration = 0;
		this.iFirstNoteBar = 0;
		this.barNumBeats = null;
		this.isNewBar = false;
		this.songIt.reset();
	};
	NotesIterator.prototype.setStart = function(iStart) {
		this._reset();
		
		while(this.index < iStart){
			this.next();
		}		
	};
	NotesIterator.prototype.setToBarStart = function() {
		this.index = this.iFirstNoteBar;
		this.duration = this.barNumBeats[0];
	};
	NotesIterator.prototype.lowerThan = function(end) {
		return this.index < end && this.index < this.noteMng.getTotal();
	};
	NotesIterator.prototype.hasNext = function() {
		return this.lowerThan(this.noteMng.getTotal());	
	};

	NotesIterator.prototype.next = function() {
		this.barNumBeats = this.songIt.getStartEndBeats();
		this.duration += this.noteMng.notes[this.index].getDuration();
		if (NoteUtils.roundBeat(this.duration) == this.barNumBeats[1] - 1) {
			this.songIt.next();
			this.iFirstNoteBar = this.index + 1;
			this.isNewBar = true;
		}
		else{
			this.isNewBar = false;
		}
		this.index++;
	};
	return NotesIterator;
});