define(['modules/StructureEdition/src/StructureEditionController',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/Cursor/src/CursorModel',
	'tests/test-songs'
], function(StructureEditionController, SongModel_CSLJson, CursorModel, testSongs) {
	return {
		run: function() {
			test("Structures Edition Controller", function(assert) {

				var songModel = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);
				var cM = new CursorModel(songModel.getComponent('notes'));
				var sec = new StructureEditionController(songModel, cM);
				var nm = songModel.getComponent('notes');
				var bm = songModel.getComponent('bars');

				// Sections
				var numberOfSections = songModel.getSections().length;
				sec.addSection();
				assert.equal(songModel.getSections().length, numberOfSections + 1, "add section");
				

				sec.removeSection();
				assert.equal(songModel.getSections().length, numberOfSections, "remove section");
				
				sec.setSectionName('ok é !');
				assert.equal(songModel.getSection(0).getName(), 'ok é !', "Section Name");

				sec.removeSection();
				assert.equal(songModel.getSections().length, numberOfSections, "remove last section should not change section length");

				// Add bar
				sec.addBar();
				assert.equal(nm.getNotesAtBarNumber(0, songModel).toString(), "E/4-q,qr,qr,qr", "test bar have been created with E at start because it's forst bar");
				cM.setPos(4);
				sec.addBar();
				assert.equal(nm.getNotesAtBarNumber(1, songModel).toString(), "qr,qr,qr,qr", "test bar have been created with only silence");
				
				// Remove bar
				sec.removeBar();
				assert.equal(nm.getNotesAtBarNumber(0, songModel).toString(), "E/4-q,qr,qr,qr", "test bar have been created with only silence");

				cM.setPos(0);
				var selBar = sec._getSelectedBars();
				assert.deepEqual(selBar, [0,0], "Selected bar");

				// Time Signature
				sec.timeSignature('3/4');
				assert.equal(bm.getBar(selBar[0]).getTimeSignature().toString(), "3/4", "Time Signature");

				// tonality
				sec.tonality('G');
				assert.equal(bm.getBar(selBar[0]).getTonality(), "G", "Tonality");

				// ending
				sec.ending('BEGIN');
				assert.equal(bm.getBar(selBar[0]).getEnding(), "BEGIN", "Ending");

				// style
				sec.style('Jazz');
				assert.equal(bm.getBar(selBar[0]).getStyle(), "Jazz", "Style");

				// label
				sec.label('Segno');
				assert.equal(bm.getBar(selBar[0]).getLabel(), "Segno", "Label");

				// sublabel
				sec.subLabel('DC al Coda');
				assert.equal(bm.getBar(selBar[0]).getSublabel(), "DC al Coda", "Sublabel");
				assert.equal(bm.getBar(selBar[0]).getSublabel(true), "DC_AL_CODA", "Sublabel formatted");
			});
		}
	};
});