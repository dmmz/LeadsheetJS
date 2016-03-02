define(['tests/test-songs',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/core/src/SongBarsIterator',
	'modules/core/src/NotesIterator'
], function(testSongs, SongModel, SongModel_CSLJson, SongBarsIterator, NotesIterator) {
	return {
		run: function() {
			test('NotesIterator', function(assert) {
				var song = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.leadSheetTimeSigChanges);
				//	song: 4/4
				//  sections:
				// 			A 			|  q q q q	|3/4  q 8 8 q | q3/2 q3/2 q3/2  q	|2/4  q  q |4/4  q q q q | q q q q | q q q q| q q q q|
				//	(start beats 		1			 5			    8					 11			13			   17		 21		 25		  29)
				//
				// 			B (6/8)		|h.	| h. |3/8  q.|
				// 						
				//  	global   numBar 8
				// 			C 			| q. |
				//  	global   numBar 11 			
				// 			D (2/4)		| h	|
				//  	global   numBar 12
				// 			E 			| h	|
				//  	global   numBar 13
				//  	    F (3/4) 	|4/4 w | 	
				//  	    
				// notes: 

				var barsIt = new SongBarsIterator(song);
				var noteMng = song.getComponent('notes');
				var notesIt = new NotesIterator(barsIt, noteMng);
				notesIt.setStart(4);
				assert.equal(notesIt.index, 4, "setting start in first note of 2nd bar ( = bar 1, as we count from 0)");
				assert.equal(notesIt.duration, 4);
				assert.equal(notesIt.iFirstNoteBar, 4);
				assert.equal(notesIt.songIt.getBarIndex(), 1);

				notesIt.setStart(6);

				var i = 0;
				var values = [
						{	index: 6,	duration: 5.5,	iFirstNoteBar: 4,	barIndex: 1,	isNewBar: false },
						{	index: 7,	duration: 6,	iFirstNoteBar: 4,	barIndex: 1,	isNewBar: false },
						{	index: 8,	duration: 7,	iFirstNoteBar: 8,	barIndex: 2,	isNewBar: true  },
						{	index: 9,	duration: 7.67,	iFirstNoteBar: 8,	barIndex: 2,	isNewBar: false },
						{	index: 10,	duration: 8.33,	iFirstNoteBar: 8,	barIndex: 2,	isNewBar: false },
						{	index: 11,	duration: 9,	iFirstNoteBar: 8,	barIndex: 2,	isNewBar: false },
						{	index: 12,	duration: 10,	iFirstNoteBar: 12,	barIndex: 3,	isNewBar: true  },
						{	index: 13,	duration: 11,	iFirstNoteBar: 12,	barIndex: 3,	isNewBar: false }
					];
				while (notesIt.lowerThan(14)) {
					assert.equal(notesIt.index, values[i].index, 'notesIt values in loop, index ' + values[i].index);
					assert.equal(Math.round(notesIt.duration * 100) / 100, values[i].duration);
					assert.equal(notesIt.iFirstNoteBar, values[i].iFirstNoteBar);
					assert.equal(notesIt.songIt.getBarIndex(), values[i].barIndex);
					assert.equal(notesIt.isNewBar, values[i].isNewBar);
					notesIt.next();
					i++;
				}
			});
		}
	}

});