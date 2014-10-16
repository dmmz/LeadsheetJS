define(['modules/converters/MusicCSLJson/SongModel_CSLJson', 'modules/core/SongModel', 'modules/chordSequence/SongView_chordSequence', 'tests/test-songs'],
	function(SongModel_CSLJson, SongModel, SongView_chordSequence, testSong) {
		return {
			run: function() {
				test("SongView_chordSequence", function(assert) {
					var song = new SongModel();
					var songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSong.simpleLeadSheet, song);
					var option = {
						displayTitle: true,
						displayComposer: true,
						displaySection: true,
						displayBar: true,
						delimiterBar: "|",
						unfoldSong: false,//TODO unfoldSong is not working yet
						fillEmptyBar: true,
						fillEmptyBarCharacter: "%",
					}
					var chordSequence = new SongView_chordSequence(songModel, option);
					var txt = chordSequence.display();

					assert.equal(txt,"Whatever song (Random Composer)\nsection: A\nAMaj7 | % | B7 | % | Em | % | F7 | % ");

					chordSequence.displayTitle = false;
					txt = chordSequence.display();
					assert.equal(txt,"(Random Composer)\nsection: A\nAMaj7 | % | B7 | % | Em | % | F7 | % ", "Display title false");
					chordSequence.displayTitle = true;

					chordSequence.displayComposer = false;
					txt = chordSequence.display();
					assert.equal(txt,"Whatever song \nsection: A\nAMaj7 | % | B7 | % | Em | % | F7 | % ", "Display composer false");
					chordSequence.displayComposer = true;

					chordSequence.displaySection = false;
					txt = chordSequence.display();
					assert.equal(txt,"Whatever song (Random Composer)\nAMaj7 | % | B7 | % | Em | % | F7 | % ", "Display section false");
					chordSequence.displaySection = true;

					chordSequence.displayBar = false;
					txt = chordSequence.display();
					assert.equal(txt,"Whatever song (Random Composer)\nsection: A\n", "Display bar false");
					chordSequence.displayBar = true;

					chordSequence.delimiterBar = "/";
					txt = chordSequence.display();
					assert.equal(txt,"Whatever song (Random Composer)\nsection: A\nAMaj7 / % / B7 / % / Em / % / F7 / % ", "delimiterBar");
					chordSequence.delimiterBar = "|";

					chordSequence.fillEmptyBar = false;
					txt = chordSequence.display();
					assert.equal(txt,"Whatever song (Random Composer)\nsection: A\nAMaj7 |  | B7 |  | Em |  | F7 |  ", "fillEmptyBar set to false");
					chordSequence.fillEmptyBar = true;

					chordSequence.fillEmptyBarCharacter = "%%";
					txt = chordSequence.display();
					assert.equal(txt,"Whatever song (Random Composer)\nsection: A\nAMaj7 | %% | B7 | %% | Em | %% | F7 | %% ", "fillEmptyBarCharacter");
					chordSequence.fillEmptyBarCharacter = "%";

				});
			}
		}
	});