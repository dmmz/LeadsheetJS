define(function() {
	/**
	 * Represents chord comments
	 * @param {ChordsEditor} chordsEditor 
	 * @param {SongModel} song         
	 */
	var ChordCommentsView = function(chordsEditor, song) {
		var chordMng = song.getComponent('chords');
		return {
			/**
			 * [getArea description]
			 * @param  {Comment|null} comment , if null, we get area from notesCursor
			 * @return {[type]}         [description]
			 */
			getArea: function(comment) {
				var indexes = comment ?
					//loading a given comment
					[comment.beatInterval[0] - 1, comment.beatInterval[1] - 1]
					//getting indexes from selection	
					: chordsEditor.controller.cursor.getPos()
				return chordsEditor.chordSpaceMng.elemMng.getElementsAreaFromCursor(chordsEditor.chordSpaceMng.chordSpaces, indexes);
			},
			isEnabled: function() {
				return chordsEditor.chordSpaceMng.isEnabled();
			},
			getBeatInterval: function() {
				var indexes = chordsEditor.controller.getSelectedChordsBeats();
				return [indexes[0], indexes[1] - 1];
				//return chordMng.getBeatIntervalByIndexes(notesCursor.getStart(), notesCursor.getEnd());
			},
			color: "#D8B337"
		}

	}
	return ChordCommentsView;

});