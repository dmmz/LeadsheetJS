define([
	'modules/LSViewer/src/TupletManager',
	'modules/LSViewer/src/BeamManager',
	'modules/core/src/NoteModel'], function(TupletManager,NoteModel) {
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
				{ keys: ["a/4"], duration: "q", tuplet:'start', time_modification:'3/2' },
				{ keys: ["b/4"], duration: "8", tuplet:'stop', time_modification:'3/2' },
				//
				{ keys: ["a/4"], duration: "q", tuplet:'start', time_modification:'3/2' },
				{ keys: ["b/4"], duration: "8" , time_modification:'3/2'},
				{ keys: ["b/4"], duration: "16" , time_modification:'3/2'},
				{ keys: ["b/4"], duration: "16", tuplet:'stop', time_modification:'3/2' },
				//
				{ keys: ["a/4"], duration: "8", tuplet:'start', time_modification:'3/2' },
				{ keys: ["b/4"], duration: "8" , time_modification:'3/2'},
				{ keys: ["b/4"], duration: "8", tuplet:'stop', time_modification:'3/2' },
				//
				{ keys: ["a/4"], duration: "8", tuplet:'start', time_modification:'3/2' },
				{ keys: ["b/4"], duration: "8" , time_modification:'3/2'},
				{ keys: ["b/4"], duration: "8", tuplet:'stop', time_modification:'3/2' }

			]);
			var tupletMng = new TupletManager();
			for (var i = 0; i < notes.length; i++) {
				tupletMng.checkTuplet(notes[i], i);
			}
			
			console.log(tupletMng.tuplets);

		});
		}
	};
});