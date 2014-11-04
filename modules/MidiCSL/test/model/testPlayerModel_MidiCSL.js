define(['modules/core/src/SongModel', 'modules/MidiCSL/src/model/PlayerModel_MidiCSL', 'modules/MidiCSL/src/model/SongModel_MidiCSL', 'modules/MidiCSL/src/model/NoteModel_MidiCSL', 'modules/MidiCSL/src/converters/SongConverterMidi_MidiCSL', 'modules/converters/MusicCSLJson/src/SongModel_CSLJson', 'tests/test-songs', 'pubsub'],
	function(SongModel, PlayerModel_MidiCSL, SongModel_MidiCSL, NoteModel_MidiCSL, SongConverterMidi_MidiCSL, SongModel_CSLJson, testSongs, pubsub) {
		return {
			run: function() {
				test("PlayerModel_MidiCSL", function(assert) {
					var emptyPlayer = new PlayerModel_MidiCSL();
					assert.ok(!emptyPlayer.getReady());
					assert.ok(!emptyPlayer.doLoop());
					assert.throws(function() {
						emptyPlayer.play();
					});
					//assert.equal(player.getPosition(), 0);

					// Create a song from testSong
					var songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet, new SongModel());

					// Convert songmodel to a readable model that we can insert in SongModel_MidiCSL
					var midiSong = SongConverterMidi_MidiCSL.exportToMidiCSL(songModel);
					var midiSongModel = new SongModel_MidiCSL({
						'song': midiSong
					});

					$.subscribe('PlayerModel_MidiCSL-onload', function(e) {
						console.log('play');
						// player.play(midiSongModel, 120);
					});
					var player = new PlayerModel_MidiCSL();

				});
			}
		}
	}
);