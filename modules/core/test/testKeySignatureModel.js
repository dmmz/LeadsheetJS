define(['modules/core/src/KeySignatureModel'], function(KeySignatureModel) {
	return {
		run: function()
		{
			test("Key Signature", function(assert) {
				//all keys
				assert.deepEqual(new KeySignatureModel("C").getAccidentals(),{});
				assert.deepEqual(new KeySignatureModel("D").getAccidentals(),{"F":"#","C":"#"});
				assert.deepEqual(new KeySignatureModel("E").getAccidentals(),{"F":"#","C":"#","G":"#","D":"#"});
				assert.deepEqual(new KeySignatureModel("F").getAccidentals(),{"B":"b"});
				assert.deepEqual(new KeySignatureModel("G").getAccidentals(),{"F":"#"});
				assert.deepEqual(new KeySignatureModel("A").getAccidentals(),{"F":"#","C":"#","G":"#"});
				assert.deepEqual(new KeySignatureModel("B").getAccidentals(),{"F":"#","C":"#","G":"#","D":"#","A":"#"});
				assert.deepEqual(new KeySignatureModel("F#").getAccidentals(),{"F":"#","C":"#","G":"#","D":"#","A":"#","E":"#"});
				assert.deepEqual(new KeySignatureModel("C#").getAccidentals(),{"F":"#","C":"#","G":"#","D":"#","A":"#","E":"#","B":"#"});
				assert.deepEqual(new KeySignatureModel("Bb").getAccidentals(),{"B":"b","E":"b"});
				assert.deepEqual(new KeySignatureModel("Eb").getAccidentals(),{"B":"b","E":"b","A":"b"});
				assert.deepEqual(new KeySignatureModel("Ab").getAccidentals(),{"B":"b","E":"b","A":"b","D":"b"});
				assert.deepEqual(new KeySignatureModel("Db").getAccidentals(),{"B":"b","E":"b","A":"b","D":"b","G":"b"});
				assert.deepEqual(new KeySignatureModel("Gb").getAccidentals(),{"B":"b","E":"b","A":"b","D":"b","G":"b","C":"b"});

				//note accidentals from key A
				var keyA = new KeySignatureModel("A");
				assert.equal(keyA.getPitchAccidental("C"),"#");
				assert.equal(keyA.getPitchAccidental("D"),"");
				assert.equal(keyA.getPitchAccidental("E"),"");
				assert.equal(keyA.getPitchAccidental("F"),"#");
				assert.equal(keyA.getPitchAccidental("G"),"#");
				assert.equal(keyA.getPitchAccidental("A"),"");
				assert.equal(keyA.getPitchAccidental("B"),"");
			});

		}
	};
});