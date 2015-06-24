define([
	'tests/test-songs',
	'modules/core/src/BarManager',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/core/src/BarModel',

	], function(testSongs,BarManager, SongModel, SongModel_CSLJson, BarModel) {
	return {
		run: function(){
			test('Bar Manager', function(assert) {
				var song = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);
				var barMng = song.getComponent('bars');
				var section = song.getSections()[0];
				
				assert.equal(barMng.getTotal(),8, 'Get number of bars in two ways');
				assert.equal(section.getNumberOfBars(),8);
				barMng.getBar(2).setTimeSignatureChange('6/8');
				barMng.getBar(6).setTimeSignatureChange('2/4');
				
				assert.equal(barMng.getBar(2).getTimeSignatureChange(), '6/8','Time signature change is set correctly');
				assert.equal(barMng.getBar(6).getTimeSignatureChange(), '2/4');
				barMng.insertBar(3, song, 1);

				assert.equal(barMng.getBar(2).getTimeSignatureChange(), '6/8');
				assert.equal(barMng.getBar(3).getTimeSignatureChange(), undefined, 'Time signature change is not copied');

				assert.equal(barMng.getBar(6).getTimeSignatureChange(), undefined, 'Second time signature been moved');
				assert.equal(barMng.getBar(7).getTimeSignatureChange(), '2/4');
								
				assert.equal(barMng.getTotal(),9, 'total number of bars has been increased');
				assert.equal(section.getNumberOfBars(),9);
				

			});
		}
	};
});