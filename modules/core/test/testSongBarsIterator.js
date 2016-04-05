define([
	'tests/test-songs',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/core/src/SongBarsIterator',

	], function(testSongs, SongModel, SongModel_CSLJson, SongBarsIterator) {
	return {
		run: function(){
			test('SongBarsIterator', function(assert) {
				var song = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.leadSheetTimeSigChanges);
				//	song: 4/4
				//  sections:
				// 			A 			|	|3/4|	|2/4|4/4|	|	|	|
				//	(start beats 		1	5	8	11	13	17	21	25	29)
				//
				// 			B (6/8)		|	|	|3/8|
				// 			
				//  	global   numBar 8
				// 			C 			|	|
				//  	global   numBar 11 			
				// 			D (2/4)		| 	|
				//  	global   numBar 12
				// 			E 			|	|
				//  	global   numBar 13
				//  	    F (3/4) 	|4/4| 			

				var barsIt = new SongBarsIterator(song);
				while (barsIt.hasNext()){
					switch (barsIt.getBarIndex()){
						case 0:
							assert.equal(barsIt.getBarTimeSignature().toString(), "4/4", "gets song general time signature")
							assert.equal(barsIt.doesTimeSignatureChange(), false);
							break;
						case 1:
							assert.equal(barsIt.getBarTimeSignature().toString(), "3/4", "bar time signature changes");
							assert.equal(barsIt.doesTimeSignatureChange(), true);
							break;
						case 2:
							assert.equal(barsIt.getBarKeySignature(), "C", "get original key signature");
							break;
						case 3:
							assert.equal(barsIt.getBarTimeSignature().toString(), "2/4");
							assert.equal(barsIt.doesTimeSignatureChange(), true);
							break;
						case 4:
							assert.equal(barsIt.getBarTimeSignature().toString(), "4/4");
							assert.equal(barsIt.doesTimeSignatureChange(), true);
							assert.equal(barsIt.getBarKeySignature(), "D", "get key signature at bar change");
							break;
						case 5:
							assert.equal(barsIt.getBarKeySignature(), "D", "get key signature after it changed, from another bar");
							assert.equal(barsIt.doesTimeSignatureChange(), false);
							break;
						case 8:
							assert.equal(barsIt.getBarTimeSignature().toString(), "6/8", "section time signature");
							assert.equal(barsIt.getBarKeySignature(), "D", "get key signature after it changed, from another section");
							assert.equal(barsIt.doesTimeSignatureChange(), true);
							break;
						case 11:
							assert.equal(barsIt.getBarTimeSignature().toString(), "3/8", "get previous bar time signature change in previous section");
							assert.equal(barsIt.doesTimeSignatureChange(), false);
							break;
						case 13:
							assert.equal(barsIt.getBarTimeSignature().toString(), "2/4",  "get previous  section time signature change in previous section");
							assert.equal(barsIt.doesTimeSignatureChange(), false);
							break;
						case 14:
							assert.equal(barsIt.getBarTimeSignature().toString(), "4/4",  "priority to bar change when both at the same time");
							assert.equal(barsIt.doesTimeSignatureChange(), true);
							break;
						
					}
					barsIt.next();
				}

				var songTimeSigChangeInEnding = {
					composer: "Random Composer",
					title: "Whatever song",
					time: "4/4",
					keySignature: "F",
					changes: [
						{
							name: "A",
							bars: 
							[{
								//barNum: 0 
								chords: [{p: "A",ch: "M7",beat: 1}],
								melody: [
									{keys: ["b/4"],duration: "wr"}
								]
							},{
								//barNum: 1 
								chords: [{p: "B",ch: "m7",beat: 1}],
								keySignature: "G",
								melody: [
									{keys: ["b/4"],duration: "wr"}
								],
								ending:1

							},{
								//barNum: 2
								timeSignature: "6/4",
								chords: [{p: "A",ch: "M7",beat: 1}],
								melody: [
									{keys: ["b/4"],duration: "wr"}
								],
							},{
								//barNum: 3 
								chords: [{p: "A",ch: "M7",beat: 1}],
								melody: [
									{keys: ["b/4"],duration: "wr"}
								],
								ending:2
							},{
								chords: [{p: "A",ch: "M7",beat: 1}],
								melody: [
									{keys: ["b/4"],duration: "wr"}
								],
							}]
						},
						{
							name:"B",
							bars:
							[{
								chords: [{p: "A",ch: "M7",beat: 1}],
								melody: [
									{keys: ["b/4"],duration: "wr"}
								]
							}]
						}
					]
				};
				var songChangeEnding = SongModel_CSLJson.importFromMusicCSLJSON(songTimeSigChangeInEnding);
				barsIt = new SongBarsIterator(songChangeEnding);

				while (barsIt.hasNext()){
					switch (barsIt.getBarIndex()){
						case 0:
							assert.equal(barsIt.getBarKeySignature().toString(),"F", "key signature F at start");
							assert.equal(barsIt.getBarTimeSignature().toString(),"4/4", "4/4 at start");
							break;
						case 1:
							assert.equal(barsIt.getBarTimeSignature().toString(),"4/4", "4/4 at start");
							assert.equal(barsIt.getBarKeySignature().toString(),"G", "key signature G");
							break;
						case 2:
							assert.equal(barsIt.getBarTimeSignature().toString(),"6/4", "6/4 in ending 1");
							break;
						case 3:
						case 4:
						case 5:
							assert.equal(barsIt.getBarKeySignature().toString(),"F", "back to F from ending 2 to the end");
							assert.equal(barsIt.getBarTimeSignature().toString(),"4/4", "back to 4/4 from ending 2 to the end");
							break;
					}
					barsIt.next();
				}

			});
		}
	};
});