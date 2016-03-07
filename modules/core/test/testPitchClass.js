define([
	'modules/core/src/Intervals',
	'modules/core/src/PitchClass'
	], function(Intervals, PitchClass){
	return {
		run : function(){
			test('PitchClass',function(assert){
				var a = new PitchClass("A");
				var csharp = new PitchClass("C#");
				var bb = new PitchClass("Bb");
				assert.equal(a.toString(), "A");
				assert.equal(a.semitoneCount, 9);
				assert.equal(csharp.toString(), "C#");
				assert.equal(csharp.semitoneCount, 1);
				assert.equal(bb.toString(), "Bb");
				assert.equal(bb.semitoneCount, 10);
				var dbb = new PitchClass("Dbb");
				assert.equal(dbb.semitoneCount, 0);

				//compareSemitones all for 6 cases
				assert.equal(a._semitonesDiff(csharp,1),	4, 	'a > csharp direction 1'); 		
				assert.equal(a._semitonesDiff(bb,1),		1, 	'a < bb,     direction 1')
				assert.equal(a._semitonesDiff(csharp,-1),	-8, 'a > csharp,  direction -1'); 	
				assert.equal(a._semitonesDiff(bb,-1),		-11,'a < bb,		direction -1');		 
				assert.equal(a._semitonesDiff(a,1), 		0,	'a == a, 		direction 1');			
				assert.equal(a._semitonesDiff(a,-1), 		0, 	'a == a, 		direction -1');
				assert.equal(a._semitonesDiff(a,-1), 		0, 	'a == a, 		direction -1');	
				//still not resolved case when transposing to augmented unison, but for the moment we are never transposing by unisons
				// assert.equal(a._semitonesDiff(new PitchClass("Ab"),-1), 		-1, 	'a > ab,  direction -1');
				// assert.equal(a._semitonesDiff(new PitchClass("Ab"),1), 			-1, 	'a < ab,  direction 1');
				
				
				assert.equal(a._sumNaturalCount("C", 3).pitchClassName, "E" ,	'C plus a 3rd= E');
				assert.equal(a._sumNaturalCount("F", 4).pitchClassName, "B",	'F plus a 4th= B');
				assert.equal(a._sumNaturalCount("E", 2, -1).pitchClassName, "D");
				assert.equal(a._sumNaturalCount("E", 9, -1).pitchClassName, "D");
				
				assert.equal(a.transposeBy(Intervals.majorThird).toString() ,csharp.toString(), 'A transpositions');
				assert.equal(a.transposeBy(Intervals.augmentedFifth).toString() , "E#");	
				assert.equal(a.transposeBy(Intervals.minorSixth).toString() , "F");	
				
				var db = new PitchClass("Db");
				assert.equal(db.transposeBy(Intervals.perfectFifth, -1).toString(), "Gb", 'Db transposing down');
				assert.equal(db.transposeBy(Intervals.minorSecond, -1).toString(), "C");
				assert.equal(db.transposeBy(Intervals.augmentedSecond, -1).toString(), "Cbb");
				
				//assert.equal(new PitchClass("Db").transposeBy(Intervals.augmentedUnison, -1).accidental, "bb");
				//assert.equal(dbb.transposeBy(Intervals.augmentedUnison, -1).accidental, undefined);
				
				assert.equal(new PitchClass("F#").transposeBy(Intervals.minorThird).toString(),"A");
				assert.equal(new PitchClass("G").transposeBy(Intervals.minorThird).toString(),"Bb");
				assert.equal(new PitchClass("Cb").transposeBy(Intervals.minorThird).toString(),"Ebb");

				assert.equal(new PitchClass("G##").transposeBy(Intervals.minorSecond,-1).toString(),"G#", 'dealing with double accidentals');
				assert.equal(new PitchClass("G##").transposeBy(Intervals.minorSecond,1).toString(),"Bb");
				assert.equal(new PitchClass("Abb").transposeBy(Intervals.minorSecond,1).toString(),"Ab");
				assert.equal(new PitchClass("Abb").transposeBy(Intervals.minorSecond,-1).toString(),"F#");
				
			})
		}
	}
	
});