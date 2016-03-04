define(['modules/core/src/ChordModel',
	'modules/ChordEdition/src/ChordEditionController',
	'modules/ChordEdition/src/ChordSpaceManager',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/Cursor/src/CursorModel',
	'modules/LSViewer/src/LSViewer',
	'modules/core/src/Intervals',
	'tests/test-songs'
], function(ChordModel, ChordEditionController, ChordSpaceManager, SongModel_CSLJson, CursorModel, LSViewer, Intervals, testSongs) {
	return {
		run: function() {
			test("Chords Edition Controller", function(assert) {
				
				function testDeleteChords(songJson){
					var song22 = SongModel_CSLJson.importFromMusicCSLJSON(songJson),
						cursor = new CursorModel(song22.getSongTotalBeats()),
						chordSpaceMng = new ChordSpaceManager(song22, cursor),
						chordsEditionController = new ChordEditionController(song22, cursor, chordSpaceMng);
					chordSpaceMng.cursor.setPos([0, 1]);
					viewer.draw(song22); //we need to draw to create chordspaces
					chordsEditionController.deleteChords();
					assert.equal(song22.getComponent('chords').getTotal(),0)
				}
				var songTimeSigChanges = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.leadSheetTimeSigChanges);
				var cmTimeSigChanges = new CursorModel(songTimeSigChanges.getSongTotalBeats());
				var csmTsc = new ChordSpaceManager(songTimeSigChanges, cmTimeSigChanges);
				var cecTsc = new ChordEditionController(songTimeSigChanges, cmTimeSigChanges, csmTsc);
				var viewer = new LSViewer($("#test")[0], {
					layer: true
				});
				viewer.draw(songTimeSigChanges);
				csmTsc.cursor.setPos([0,0]);
				assert.deepEqual(cecTsc.getSelectedChordsBeats(),[1,2], 'get chord beats: first measure');

				csmTsc.cursor.setPos([0,3]);
				assert.deepEqual(cecTsc.getSelectedChordsBeats(),[1,5], 'get chord beats: first measure');

				csmTsc.cursor.setPos([0,6]);
				assert.deepEqual(cecTsc.getSelectedChordsBeats(),[1,8], 'get chord beats: first 2 measures');

				csmTsc.cursor.setPos([26,29]);
				assert.deepEqual(cecTsc.getSelectedChordsBeats(),[27,30], 'cursor including two consecutive measures with time signature with different beat units');

				csmTsc.cursor.setPos([27,27]);
				assert.deepEqual(cecTsc.getSelectedChordsBeats(),[28,29], 'cursor in last position before time signature change');

				csmTsc.cursor.setPos([27,28]);
				assert.deepEqual(cecTsc.getSelectedChordsBeats(),[28,29.5], 'cursor including only two positions, that comprise different time signature measures');
				
				csmTsc.cursor.setPos([26,47]);
				assert.deepEqual(cecTsc.getSelectedChordsBeats(),[27,40], 'cursor including two time signature changes with different beat unit');

				csmTsc.cursor.setPos([51,54]);
				assert.deepEqual(cecTsc.getSelectedChordsBeats(),[43,46],'last measure');



				//copy / paste / delete
				var songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);
				
				var cM = new CursorModel(songModel.getSongTotalBeats());
				var csm = new ChordSpaceManager(songModel, cM);
				var cec = new ChordEditionController(songModel, cM, csm);
				viewer = new LSViewer($("#test")[0], {
					layer: true
				});
				viewer.draw(songModel);

				csm.createAllChordSpaces(viewer);

				 
				// Delete chords
				csm.cursor.setPos([0, 1]);
				assert.deepEqual(cec.getSelectedChordsIndexes(), [0], 'getSelectedChordsIndexes');

				csm.cursor.setPos([0, 8]);
				assert.deepEqual(cec.getSelectedChordsIndexes(), [0, 1], 'getSelectedChordsIndexes');
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
				assert.deepEqual(cec2.buffer, [1,10], 'copy chords buffer, chord spaces go from 0 to 8, so from beat 1 to 9, 9 included, so beatStart is 1 and beatEnd is 10');

				// Paste chords
				csm2.cursor.setPos([8, 10]);
				assert.deepEqual(cec2.getSelectedChordsIndexes(), [1], 'getSelectedChordsIndexes');
				assert.deepEqual(chordManager2.getChords().toString(), "AM7,B7,Em,F7", 'Chords Name at start');
				cec2.pasteChords();
				assert.deepEqual(chordManager2.getChords().toString(), "AM7,AM7,B7,F7", 'Paste chords');

				var song2Json = {
					composer: "Random Composer",
					title: "song22",
						time: "2/2",
						changes: [{
							id: 0,
							name: "A",
							bars: [{
								chords: [{
									p: "A",
									ch: "M7",
									beat: 1
								},
								{
									p: "F",
									ch: "m",
									beat: 1.5
								},
								{
									p: "G",
									ch: "",
									beat: 2
								},
								{
									p: "C",
									ch: "m",
									beat: 2.5
								}],
								melody: [{
									keys: ["a/4"],
									duration: "w"
								}]
							}]
						}]
				};
				testDeleteChords(song2Json);
			});

		}
	};
});