define([
	'modules/LSViewer/src/TupletManager',
	'modules/LSViewer/src/BeamManager',
	'modules/core/src/NoteModel'], function(TupletManager,BeamManager, NoteModel) {
	return {
		run: function() {
			test("tupletAndBeamsManager", function(assert) {
			function createMelody(arrNotes){
				var noteModels = [];
				for (var i = 0; i < arrNotes.length; i++) {
					noteModels.push(new NoteModel(arrNotes[i]));
				}
				return noteModels;
			}

			var notes = createMelody([
				{ keys: ["a/4"], duration: "q", tuplet:'start', timeModification:'3/2' }, //0
				{ keys: ["b/4"], duration: "8", tuplet:'stop', timeModification:'3/2' },  // 0.666
				
				//
				{ keys: ["a/4"], duration: "q", tuplet:'start', timeModification:'3/2' }, //1
				{ keys: ["b/4"], duration: "q" , timeModification:'3/2'},				   //1.666
				{ keys: ["b/4"], duration: "8",  timeModification:'3/2' },					//2.3333
				{ keys: ["b/4"], duration: "8", tuplet:'stop', timeModification:'3/2' },	//2.6666			
				//
				{ keys: ["b/4"], duration: "8" , tuplet:'start', timeModification:'3/2'}, //3
				{ keys: ["b/4"], duration: "8" , timeModification:'3/2'},					//3.333
				{ keys: ["b/4"], duration: "16" , timeModification:'3/2'},					//3.666
				{ keys: ["b/4"], duration: "16", tuplet:'stop', timeModification:'3/2' },	//3.833
																							//4
				
				/*{ keys: ["a/4"], duration: "8", tuplet:'start', timeModification:'3/2' },
				{ keys: ["b/4"], duration: "8" , timeModification:'3/2'},
				{ keys: ["b/4"], duration: "8", tuplet:'stop', timeModification:'3/2' },*/
				//
			]);
			var tupletMng = new TupletManager();
			for (var i = 0; i < notes.length; i++) {
				tupletMng.checkTuplet(notes[i], i);
			}
			
			assert.deepEqual(tupletMng.tuplets[0],[0,1], "tuplet generated");
			assert.deepEqual(tupletMng.tuplets[1],[2,5]);
			assert.deepEqual(tupletMng.tuplets[2],[6,9]);

			var beamMng = new BeamManager();
			var beams = beamMng._getBeatBeamIndexes(notes,1);

			assert.deepEqual(beams,[
				[0,1],
				[2,3],
				[4,5],
				[6,9]
			],"getBeatBeamIndexes");

			//second test with its own scope
			(function(){
				var tuplets = [
					[1,3]
				];
				var beams = [
					[1, 2],
					[3, 4]
				];
				var beamMng = new BeamManager();
				assert.deepEqual(beamMng._mergeBeamIndexes(tuplets, beams), [[1, 3]], "_mergeBeamIndexes");

				tuplets = [
					[1,3]
				];
				beams = [
					[0,4]
				];
				assert.deepEqual(beamMng._mergeBeamIndexes(tuplets, beams), [[0,4]]);

				tuplets = [
					[1,3]
				];
				beams = [
					[0, 2],
					[3, 4]
				];
				assert.deepEqual(beamMng._mergeBeamIndexes(tuplets, beams), [[1,3]]);	
				assert.deepEqual(beamMng._mergeBeamIndexes([], beams), beams, "when no tuplets, beams are not changed");
				
				beams = [
					[0,4],
					[4,6],
					[7,8],
					[9,12],
					[13,16]
				];
				assert.deepEqual(beamMng._cutBeamsByIndex(beams, [2,5,8,9,15]), [[0,1],[3,4],[10,12],[13,14]], '_cutBeamsByIndex: covering all 5 if cases');
			})();

		});
		}
	};
});