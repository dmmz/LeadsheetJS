define(function() {
	/**
	 * Represents notes comments
	 * @param {NoteSpaceManager} noteSpaceMng 
	 * @param {Cursor} notesCursor  
	 * @param {SongModel} song         
	 */
	var NoteCommentsView = function(noteSpaceMng, notesCursor, song) {
		var noteMng = song.getComponent('notes');
		return {
			/**
			 * @param  {Comment|null} comment , if null, we get area from notesCursor
			 * @return {[type]}         [description]
			 */
			getArea: function(comment) {
				var indexes = comment ?
					//loading a given comment
					noteMng.getIndexesStartingBetweenBeatInterval(comment.beatInterval[0], comment.beatInterval[1], true)
					//getting indexes from selection		
					: [notesCursor.getStart(), notesCursor.getEnd()];

				return noteSpaceMng.elemMng.getElementsAreaFromCursor(noteSpaceMng.noteSpace, indexes);
			},
			isEnabled: function() {
				return noteSpaceMng.isEnabled();
			},
			getBeatInterval: function() {
				return noteMng.getBeatIntervalByIndexes(notesCursor.getStart(), notesCursor.getEnd());
			},
			color: "#EB9696"
		}
	}
	return NoteCommentsView;

});