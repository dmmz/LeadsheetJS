define(['modules/Tag/src/Tag'], function(Tag) {
	var ChordsTag = function(tagParams, song, chordSpaceMng) {
		var startBeat = tagParams.startBeat;
		var endBeat = tagParams.endBeat;
		tagParams.type = 'chords';
		var tag = Tag(startBeat, endBeat, name, 'chords');

		tag.getArea = function() {
			var chordMng = song.getComponent('chords');
			var indexesChords = chordMng.getChordsRelativeToBeat(song, startBeat, endBeat);	

			var fromIndex = indexesChords[0].index,
				toIndex   = indexesChords[indexesChords.length - 1].index;

			return tag.elemMng.getElementsAreaFromCursor(chordSpaceMng.chordSpaces, [fromIndex, toIndex]);
		}
		return tag;
	}
	return ChordsTag;

});