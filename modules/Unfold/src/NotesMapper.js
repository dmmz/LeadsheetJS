define(function(){ 
	var NotesMapper = function() {
		this.noteIndexes = [];
	};
	NotesMapper.prototype._getLastIndexes = function() {
		return this.noteIndexes.length !== 0 ? this.noteIndexes[this.noteIndexes.length - 1] : false;
	};
	/*NotesMapper.prototype.addIndexes = function(indexes) {
		var lastIdx = this._getLastIndexes();
		if (lastIdx && lastIdx[1] === indexes[0]){
			lastIdx[1] = indexes[1];
		} else {
			this.noteIndexes.push(indexes);
		}
	};*/
	NotesMapper.prototype.addIndexes = function(indexes) {
		for (var i = indexes[0]; i < indexes[1]; i++) {
			this.noteIndexes.push(i);
		}
	};
	

	return NotesMapper;
});