define(function(require) {
	var SongModel = require('modules/core/src/SongModel');
	var SectionModel = require('modules/core/src/SectionModel');
	var BarManager = require('modules/core/src/BarManager');
	var BarModel = require('modules/core/src/BarModel');
	var ChordManager = require('modules/core/src/ChordManager');
	var ChordModel = require('modules/core/src/ChordModel');
	var testSongs = require('tests/test-songs');
	var SongModel_CSLJson = require('modules/converters/MusicCSLJson/src/SongModel_CSLJson');
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

				cm.removeChordsBetweenPositions(0, 1, 1000, 1000);
				assert.equal(cm.getChords().length, 0);

				var song = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);
				var chordMng = song.getComponent('chords');
				assert.deepEqual(chordMng.getBeatIntervalByIndexes(song, 0, 0),[1,5],'getBeatIntervalByIndexes');
				assert.deepEqual(chordMng.getBeatIntervalByIndexes(song, 0, 1),[1,13]);
				assert.deepEqual(chordMng.getBeatIntervalByIndexes(song, 1, 2),[9,21]);
				assert.deepEqual(chordMng.getBeatIntervalByIndexes(song, 0, 3),[1,29]);

				
				var songTimeSig = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.leadSheetTimeSigChanges);
				chordMng = songTimeSig.getComponent('chords');
				assert.deepEqual(chordMng.getBeatsBasedChordIndexes(songTimeSig), [1, 3, 5, 7, 8, 11, 13, 17, 21, 25, 29, 32, 35, 36.5, 38, 40, 42], 'getBeatsBasedChordIndexes');
				
				var selectedChords = chordMng.getChordsRelativeToBeat(songTimeSig, 1, 9);
				assert.deepEqual(selectedChords[0],{beat:0,index:0});
				assert.deepEqual(selectedChords[4],{beat:7,index:4});
				
				selectedChords = chordMng.getChordsRelativeToBeat(songTimeSig, 28, 35);
				assert.deepEqual(selectedChords[0],{beat:1,index:10});
				assert.deepEqual(selectedChords[1],{beat:4,index:11});

				assert.deepEqual(chordMng.getBarNumAndBeatFromBeat(songTimeSig,32),{beatNumber:1,barNumber:9, notExactBeat: false});				
				assert.deepEqual(chordMng.getBarNumAndBeatFromBeat(songTimeSig,36.5),{beatNumber:1,barNumber:11, notExactBeat: false});
				assert.deepEqual(chordMng.getBarNumAndBeatFromBeat(songTimeSig,1.5),{beatNumber:2,barNumber:0, notExactBeat: true});
				assert.deepEqual(chordMng.getBarNumAndBeatFromBeat(songTimeSig,1000),{exceedsSongLength:true});

			});
		}
	};
});