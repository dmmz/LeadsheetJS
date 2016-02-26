define([
	'modules/core/src/Intervals',
	'modules/core/src/Note'
	],function(Intervals, Note){
	return {
		run: function(){
			test('Note', function(assert){
				var note = new Note("F","","4");
				note.transposeBy(Intervals.perfectFifth);
				assert.equal(note.toString(), "C/5");

				var note2 = new Note("E","","4");
				note2.transposeBy(Intervals.perfectFourth, -1);
				assert.equal(note2.toString(), "B/3");			

			});
		}
	}
})