define([
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson', 
	'modules/core/src/SongModel', 
	'tests/test-songs',
	'tests/songs/IMeanYou'

	], function(SongModel_CSLJson, SongModel, testSongs, IMeanYou) {
	return {
		run: function() {
			test("SongModel_CSLJson", function(assert) {
				
				var song = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.leadSheetTimeSigChanges);
				
				assert.equal(song.getTonality(), "C", 'test key signature  by default');
				assert.equal(song.getTimeSignature(), "4/4", 'test time signature by default');
				assert.equal(song.getComponent('bars').getBar(1).getTimeSignatureChange().toString(),"3/4", 'imported time signature change');
				assert.equal(song.getComponent('bars').getBar(4).getKeySignatureChange(),"D", 'imported key signature change');
				
				var exportedCSLJson = SongModel_CSLJson.exportToMusicCSLJSON(song);
				
				assert.equal(exportedCSLJson.changes[0].bars[1].timeSignature, "3/4", 'exported time signature change');
				assert.equal(exportedCSLJson.changes[0].bars[4].keySignature, "D", 'exported key signature change');

				
				SongModel_CSLJson.importFromMusicCSLJSON(IMeanYou);
				
			});
		}
	}
});