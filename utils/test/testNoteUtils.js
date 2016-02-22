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


			});
		}
	}
});