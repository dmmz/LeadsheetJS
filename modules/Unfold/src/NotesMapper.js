define(function() {
	/**
	 * maps notes between folded and unfolded versions of the song
	 * each position corresponds to a note in unfolded song, value corresponds to folded song
	 */
	var NotesMapper = function() {
		this.noteIndexes = [];
	};
	NotesMapper.prototype._getLastIndexes = function() {
		return this.noteIndexes.length !== 0 ? this.noteIndexes[this.noteIndexes.length - 1] : false;
	};
	NotesMapper.prototype.addIndexes = function(indexes) {
		for (var i = indexes[0]; i < indexes[1]; i++) {
			this.noteIndexes.push(i);
		}
	};
	return NotesMapper;
});