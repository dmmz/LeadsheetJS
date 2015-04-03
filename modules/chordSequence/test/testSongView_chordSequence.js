define(['modules/converters/MusicCSLJson/src/SongModel_CSLJson', 'modules/core/src/SongModel', 'modules/chordSequence/src/SongView_chordSequence', 'tests/test-songs'],
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
						delimiterNewLine: "\n",
						fillEmptyBar: true,
						fillEmptyBarCharacter: "%",
					};
					var div = document.createElement('div');
					var chordSequence = new SongView_chordSequence(div, songModel, option);
					var txt = chordSequence.draw();

					assert.equal(div.innerHTML,"<span class=\"song_view-title\">Whatever song</span> (Random Composer)\n\nA: AM7 | % | B7 | % | Em | % | F7 | % \n");

					chordSequence.displayTitle = false;
					chordSequence.draw();
					assert.equal(div.innerHTML,"(Random Composer)\n\nA: AM7 | % | B7 | % | Em | % | F7 | % \n", "Display title false");
					chordSequence.displayTitle = true;

					chordSequence.displayComposer = false;
					chordSequence.draw();
					assert.equal(div.innerHTML,"<span class=\"song_view-title\">Whatever song</span> \n\nA: AM7 | % | B7 | % | Em | % | F7 | % \n", "Display composer false");
					chordSequence.displayComposer = true;

					chordSequence.displaySection = false;
					chordSequence.draw();
					assert.equal(div.innerHTML,"<span class=\"song_view-title\">Whatever song</span> (Random Composer)\n\nAM7 | % | B7 | % | Em | % | F7 | % \n", "Display section false");
					chordSequence.displaySection = true;

					chordSequence.displayBar = false;
					chordSequence.draw();
					assert.equal(div.innerHTML,"<span class=\"song_view-title\">Whatever song</span> (Random Composer)\n\nA: \n", "Display bar false");
					chordSequence.displayBar = true;

					chordSequence.delimiterBar = "/";
					chordSequence.draw();
					assert.equal(div.innerHTML,"<span class=\"song_view-title\">Whatever song</span> (Random Composer)\n\nA: AM7 / % / B7 / % / Em / % / F7 / % \n", "delimiterBar");
					chordSequence.delimiterBar = "|";

					chordSequence.fillEmptyBar = false;
					chordSequence.draw();
					assert.equal(div.innerHTML,"<span class=\"song_view-title\">Whatever song</span> (Random Composer)\n\nA: AM7 | | B7 | | Em | | F7 | \n", "fillEmptyBar set to false");
					chordSequence.fillEmptyBar = true;

					chordSequence.fillEmptyBarCharacter = "%%";
					chordSequence.draw();
					assert.equal(div.innerHTML,"<span class=\"song_view-title\">Whatever song</span> (Random Composer)\n\nA: AM7 | %% | B7 | %% | Em | %% | F7 | %% \n", "fillEmptyBarCharacter");
					chordSequence.fillEmptyBarCharacter = "%";

				});
			}
		}
	});