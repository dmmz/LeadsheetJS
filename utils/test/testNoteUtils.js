define([
	'utils/NoteUtils',
], function(NoteUtils) {
	return {
		run: function() {
			test("NoteUtils", function(assert) {
				assert.equal(NoteUtils.getNextKey('A/4',1),'B/4');
				assert.equal(NoteUtils.getNextKey('B/4',1),'C/5');
				
				assert.equal(NoteUtils.getNextChromaticKey('A/4',1),'A#/4');
				assert.equal(NoteUtils.getNextChromaticKey('A#/4',1),'B/4');
				assert.equal(NoteUtils.getNextChromaticKey('B/4',1),'C/5');
				assert.equal(NoteUtils.getNextChromaticKey('C/5',1),'C#/5');
				assert.equal(NoteUtils.getNextChromaticKey('C#/5',1),'D/5');
				assert.equal(NoteUtils.getNextChromaticKey('D/5',1),'D#/5');
				assert.equal(NoteUtils.getNextChromaticKey('D#/5',1),'E/5');
				assert.equal(NoteUtils.getNextChromaticKey('F/5',1),'F#/5');
				assert.equal(NoteUtils.getNextChromaticKey('F#/5',1),'G/5');
				assert.equal(NoteUtils.getNextChromaticKey('G/5',1),'G#/5');
				assert.equal(NoteUtils.getNextChromaticKey('A/5',-1),'Ab/5');
				assert.equal(NoteUtils.getNextChromaticKey('Ab/5',-1),'G/5');
				assert.equal(NoteUtils.getNextChromaticKey('G/5',-1),'Gb/5');
				assert.equal(NoteUtils.getNextChromaticKey('Gb/5',-1),'F/5');
				assert.equal(NoteUtils.getNextChromaticKey('F/5',-1),'E/5');
				assert.equal(NoteUtils.getNextChromaticKey('E/5',-1),'Eb/5');
				
				assert.equal(NoteUtils.getNextChromaticKey('Ab/4',1),'A/4');
				
				assert.equal(NoteUtils.pitch2Number("C"),0, 'pitch2Number without accidentals');
				assert.equal(NoteUtils.pitch2Number("D"),2);
				assert.equal(NoteUtils.pitch2Number("E"),4);
				assert.equal(NoteUtils.pitch2Number("F"),5);
				assert.equal(NoteUtils.pitch2Number("G"),7);
				assert.equal(NoteUtils.pitch2Number("A"),9);
				assert.equal(NoteUtils.pitch2Number("B"),11);

				assert.equal(NoteUtils.pitch2Number("Cb"),11,'pitch2Number simple accidentals');
				assert.equal(NoteUtils.pitch2Number("C#"),1);
				assert.equal(NoteUtils.pitch2Number("Db"),1);
				assert.equal(NoteUtils.pitch2Number("D#"),3);
				assert.equal(NoteUtils.pitch2Number("Eb"),3);
				assert.equal(NoteUtils.pitch2Number("E#"),5);
				assert.equal(NoteUtils.pitch2Number("Fb"),4);
				assert.equal(NoteUtils.pitch2Number("F#"),6);
				assert.equal(NoteUtils.pitch2Number("Gb"),6);
				assert.equal(NoteUtils.pitch2Number("G#"),8);
				assert.equal(NoteUtils.pitch2Number("Ab"),8);
				assert.equal(NoteUtils.pitch2Number("A#"),10);
				assert.equal(NoteUtils.pitch2Number("Bb"),10);
				assert.equal(NoteUtils.pitch2Number("B#"),0);

				assert.equal(NoteUtils.pitch2Number("Cbb"),10,'pitch2Number double accidentals');
				assert.equal(NoteUtils.pitch2Number("C##"),2);
				assert.equal(NoteUtils.pitch2Number("Fbb"),3);
				assert.equal(NoteUtils.pitch2Number("F##"),7);
				assert.equal(NoteUtils.pitch2Number("Bbb"),9);
				assert.equal(NoteUtils.pitch2Number("B##"),1);
				
				//assert.equal()


			});
		}
	}
});