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
				chordManager.insertChord(0, chord);
				assert.equal(chordManager.getTotal(), 2);

				chordManager.removeChord(chord);
				assert.equal(chordManager.getTotal(), 1);
				assert.equal(chordManager.getChordIndex(chord), undefined);

				var sm = new SongModel();
				sm.addSection(new SectionModel({
					'numberOfBars': 3
				}));

				sm.getComponent('bars').addBar(new BarModel());
				sm.getComponent('bars').addBar(new BarModel());
				sm.getComponent('bars').addBar(new BarModel());
				var cm = new ChordManager();
				cm.addChord(new ChordModel({
					'note': 'G',
					'chordType': '7',
					'beat': 2,
					'barNumber': 0
				}));
				cm.addChord(new ChordModel({
					'note': 'F',
					'chordType': 'M7',
					'beat': 3,
					'barNumber': 2
				}));
				
				assert.equal(cm.getChordDurationFromBarNumber(sm, 0, 0), 3, 'chord duration - first bar');
				assert.equal(cm.getChordDurationFromBarNumber(sm, 0, 1), 4, 'chord duration - last full bar');
				assert.equal(cm.getChordDurationFromBarNumber(sm, 0, 2), 2, 'chord duration - end bar');


			});
		}
	};
});