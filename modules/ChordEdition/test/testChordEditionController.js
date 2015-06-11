define(['modules/core/src/ChordModel',
	'modules/ChordEdition/src/ChordEditionController',
	'modules/ChordEdition/src/ChordSpaceManager',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/Cursor/src/CursorModel',
	'modules/LSViewer/src/LSViewer',
	'tests/test-songs'
], function(ChordModel, ChordEditionController, ChordSpaceManager, SongModel_CSLJson, CursorModel, LSViewer, testSongs) {
	return {
		run: function() {
			test("Chords Edition Controller", function(assert) {

				var songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);
				var cM = new CursorModel(songModel.getSongTotalBeats());
				var csm = new ChordSpaceManager(songModel, cM);
				var cec = new ChordEditionController(songModel, cM, csm);
				var viewer = new LSViewer($("#vexflow_testoutput")[0], {
					layer: true
				});

				viewer.draw(songModel);
				//csm.createChordSpace(viewer);

				csm.cursor.setPos([0, 1]);
				assert.deepEqual(cec.getSelectedChordsIndexes(), [0], 'getSelectedChordsIndexes');

				csm.cursor.setPos([0, 8]);
				assert.deepEqual(cec.getSelectedChordsIndexes(), [0, 1], 'getSelectedChordsIndexes');

				// Delete chords
				csm.cursor.setPos([0, 1]);
				cec.deleteChords();
				assert.deepEqual(cec.getSelectedChordsIndexes(), [], 'delete chords');

				// Copy chords
				var songModel2 = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);
				var cM2 = new CursorModel(songModel2.getSongTotalBeats());
				var csm2 = new ChordSpaceManager(songModel2, cM2);
				var cec2 = new ChordEditionController(songModel2, cM2, csm2);

				var chordManager2 = songModel2.getComponent('chords');
				viewer.draw(songModel2);

				csm2.cursor.setPos([0, 8]);
				assert.equal(cec2.buffer, undefined, 'copy chords buffer is empty');
				assert.deepEqual(cec2.getSelectedChordsIndexes(), [0, 1], 'getSelectedChordsIndexes');

				cec2.copyChords();
				assert.deepEqual(cec2.buffer, [chordManager2.getChord(0), chordManager2.getChord(1)], 'copy chords buffer is fulled');

				// Paste chords
				csm2.cursor.setPos([8, 10]);
				assert.deepEqual(cec2.getSelectedChordsIndexes(), [1], 'getSelectedChordsIndexes');
				assert.deepEqual(chordManager2.getChords().toString(), "AM7,B7,Em,F7", 'Chords Name at start');
				cec2.pasteChords();
				assert.deepEqual(chordManager2.getChords().toString(), "AM7,F7,AM7,B7", 'Paste chords');
			});
		}
	};
});