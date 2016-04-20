define(['modules/Tag/src/Tag'], function(Tag) {
	var NotesTag = function(tagParams, song, noteSpaceMng) {
		var startBeat = tagParams.startBeat;
		var endBeat = tagParams.endBeat;
		var name = tagParams.name;
		var tag = Tag(startBeat, endBeat, name, 'notes');

		tag.getArea = function() {
			var notesMng = song.getComponent('notes');
			var	startEnd = notesMng.getIndexesStartingBetweenBeatInterval(startBeat, endBeat, true);
			var fromIndex = startEnd[0],
				toIndex = startEnd[1];
		
			return tag.elemMng.getElementsAreaFromCursor(noteSpaceMng.noteSpace, [fromIndex, toIndex]);
		}
		return tag;

	}
	return NotesTag;

});