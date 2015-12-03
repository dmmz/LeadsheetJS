define(function(require) {
	var SongModel = require('modules/core/src/SongModel');
	var SectionModel = require('modules/core/src/SectionModel');
	var BarManager = require('modules/core/src/BarManager');
	var BarModel = require('modules/core/src/BarModel');
	var ChordManager = require('modules/core/src/ChordManager');
	var ChordModel = require('modules/core/src/ChordModel');
	return {
		run: function() {
			test("ChordManager", function(assert) {
				var chordManager = new ChordManager();

				assert.equal(chordManager.getTotal(), 0);
				chordManager.addChord();
				assert.equal(chordManager.getTotal(), 1);

				assert.throws(function() {
					chordManager.removeChord();
				});
				var chord = new ChordModel();
				chord.setNote('NC');
				chordManager.addChord(chord);
				assert.equal(chordManager.getTotal(), 2);

				chordManager.removeChord(chord);
				assert.equal(chordManager.getTotal(), 1);
				assert.equal(chordManager.getChordIndex(chord), undefined);

				var sm = new SongModel();
				sm.addSection(new SectionModel({
					'numberOfBars': 4
				}));

				sm.getComponent('bars').addBar(new BarModel());
				sm.getComponent('bars').addBar(new BarModel());
				sm.getComponent('bars').addBar(new BarModel());
				var cm = new ChordManager();
				chord = new ChordModel({
					'note': 'G',
					'chordType': '7',
					'beat': 2,
					'barNumber': 0
				});
				cm.addChord(chord);
				var chord2 = new ChordModel({
					'note': 'F',
					'chordType': 'M7',
					'beat': 3,
					'barNumber': 2
				});
				cm.addChord(chord2);

				assert.equal(cm.getChordDurationFromBarNumber(sm, 0, 0), 3, 'chord duration - first bar');
				assert.equal(cm.getChordDurationFromBarNumber(sm, 0, 1), 4, 'chord duration - last full bar');
				assert.equal(cm.getChordDurationFromBarNumber(sm, 0, 2), 2, 'chord duration - end bar');

				assert.equal(cm.getChordDuration(sm, 0), 9, 'chord duration - first');
				assert.equal(cm.getChordDuration(sm, 1), 6, 'chord duration - last');
				assert.equal(cm.getChordDuration(sm, 2), undefined, 'chord does not exist');

				assert.equal(cm.getChordsByBarNumber(0)[0].toString(), chord.toString());

				// increment and decrement
				cm.incrementChordsBarNumberFromBarNumber(1, 0);
				assert.equal(cm.getChordsByBarNumber(1)[0].toString(), chord.toString());

				cm.incrementChordsBarNumberFromBarNumber(-1, 0);
				assert.equal(cm.getChordsByBarNumber(0)[0].toString(), chord.toString());

				// delete chord by bar
				cm.removeChordsByBarNumber(0);
				assert.equal(cm.getChordsByBarNumber(0)[0], undefined);

				// Delete chords between positions
				cm.addChord(chord);
				var chord3 = new ChordModel({
					'note': 'C',
					'chordType': 'm',
					'beat': 2,
					'barNumber': 4
				});
				cm.addChord(chord3);
				assert.equal(cm.getChords().toString(), "G7,FM7,Cm");
				cm.removeChordsBetweenPositions(2, 1, 3, 3);
				assert.equal(cm.getChords().toString(), "G7,Cm");
				
				assert.deepEqual(cm.getContextOfSelectedChords([0,0], 1), [[],[1]], "context selection");
				assert.deepEqual(cm.getContextOfSelectedChords([1,1], 1), [[0],[]], "context selection");

			});
		}
	};
});