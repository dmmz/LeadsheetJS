define(['modules/core/src/SongModel',
	'modules/FileEdition/src/FileEditionController',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/converters/MusicXML/src/SongModel_MusicXML',
	'modules/converters/MusicXML/utils/musicXMLParser',
	'tests/test-songs'
], function(SongModel, FileEditionController, SongModel_CSLJson, SongModel_MusicXML, MusicXMLParser, testSongs) {
	return {
		run: function() {
			test("File Edition Controller", function(assert) {
				var fec = new FileEditionController(new SongModel());
				fec.importMusicCSLJSON(testSongs.simpleLeadSheet);

				var songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);
				assert.deepEqual(fec.songModel, songModel, "importFromMusicCSLJSON");

				var mxlParse = new MusicXMLParser();
				var docString = mxlParse.fetch("ferme.xml");
				fec.importMusicXML(docString);
				songModel = SongModel_MusicXML.importFromMusicXML(docString);
				assert.deepEqual(fec.songModel.getComponent('notes'), songModel.getComponent('notes'), "importFromMusicXML");
				assert.deepEqual(fec.songModel.getComponent('chords'), songModel.getComponent('chords'), "importFromMusicXML");
				assert.deepEqual(fec.songModel.getComponent('bars'), songModel.getComponent('bars'), "importFromMusicXML");

			});
		}
	};
});