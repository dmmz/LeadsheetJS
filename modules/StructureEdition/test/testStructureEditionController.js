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

				assert.equal(nm.getNotesAtBarNumber(2, songModel).toString(), "", "test bar have been created with only silence");
				sec.addSection();
				assert.equal(nm.getNotesAtBarNumber(2, songModel).toString(), "qr,qr,qr,qr", "test bar have been created with only silence");
				sec.removeSection();

				// Add bar
				sec.addBar();
				assert.equal(nm.getNotesAtBarNumber(0, songModel).toString(), "E/4-q,qr,qr,qr", "test bar have been created with E at start because it's first bar");
				cM.setPos(4);
				sec.addBar();
				assert.equal(nm.getNotesAtBarNumber(1, songModel).toString(), "qr,qr,qr,qr", "test bar have been created with only silence");

				// Remove bar
				sec.removeBar();
				assert.equal(nm.getNotesAtBarNumber(0, songModel).toString(), "E/4-q,qr,qr,qr", "test bar have been created with only silence");

				cM.setPos(0);
				var selBar = sec._getSelectedBars();
				assert.deepEqual(selBar, [0, 0], "Selected bar");

				

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
				

				//TIME SIGNATURE CHANGES
				//Rules:
				//
				//change time signature only in those measures which are selected, and if inside the selection there is a time signature change, we change until the first time signature change
				
				// if only silences, we just change time signature and replace with appropriate time changes
				// if not only silences:
				//		- we try to cut figures into tied notes, but cannot cut 'tuplets', we forbid it in that case
				//		- if new time signature makes measures shorter than before, we fill with rests +
				//		- if new time signature makes measures longer than before, we add as many bars as needed. we fill with gaps if needed
				// 
				// 
				//With Silences
				//SetTimeSignature
				//Empty song in 4/4, with a whole rest in each bar
				var song = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.wholeSilencesSong, song);
				
				cM = new CursorModel(song.getComponent('notes'));
				sec = new StructureEditionController(song, cM);
				var noteMng = song.getComponent('notes');
				
				assert.equal(noteMng.getNotes().toString(),'wr,wr,wr,wr,wr,wr,wr,wr','initial notes for empty song');
				//we put cursor in note 5 (= bar 5, as there is one note per bar)				
				cM.setPos(5);
				sec.setTimeSignature("6/8");
				assert.equal(noteMng.getNotes().toString(),'wr,wr,wr,wr,wr,qr,qr,qr,wr,wr','notes after changing time signature to 6/8 in bar 5');
				
				assert.equal(song.getTimeSignatureAt(5).toString(),'6/8','time signature changed');
				assert.equal(song.getTimeSignatureAt(6).toString(),'4/4','time signature in the following bar is not changed');

				//we put cursor in notes 5 and 6 (= bars 5 and 6), we try to change the whole selection to 6/8, but everything will remain as it is
				//because it changes the time signature until first change in selection, and time signature until first time is already 6/8, so no changes
				cM.setPos([5,8]);
				sec.setTimeSignature("6/8");
				assert.equal(noteMng.getNotes().toString(),'wr,wr,wr,wr,wr,qr,qr,qr,wr,wr','notes after changing time signature to 6/8 from bar 5 to 8');
				assert.equal(song.getTimeSignatureAt(5).toString(),'6/8','time signature changed');
				assert.equal(song.getTimeSignatureAt(6).toString(),'4/4','time signature in the following bar is not changed');

				//in bar 4 we set to 2/2 
				cM.setPos(4);
				sec.setTimeSignature("2/2");
				assert.equal(
					noteMng.getNotes().toString(),
					/*bar 0*/'wr,wr,wr,wr,'+/*bar 4:*/'qr,qr,qr,qr,'+/*bar 5*/'qr,qr,qr,wr,wr',
					'notes after changing time signature to 2/2 in 4');
				assert.equal(song.getTimeSignatureAt(4).toString(),'2/2','time signature changed');
				assert.equal(song.getTimeSignatureAt(5).toString(),'6/8','time signature in the following bar is not changed');
				
				//we set last bar to 3/8
				var lastNoteIndex = noteMng.getTotal()-1;
				cM.setPos(lastNoteIndex);
				sec.setTimeSignature("3/8");
				assert.equal(noteMng.getNotes().toString(),/*bar 0*/'wr,wr,wr,wr,'+/*bar 4:*/'qr,qr,qr,qr,'+/*bar 5*/'qr,qr,qr,wr,qr,8r','notes after changing time signature');
				assert.equal(song.getTimeSignatureAt(7),'3/8');

				//SONG WITH NOTES
				var simpleSong = SongModel_CSLJson.importFromMusicCSLJSON(testSongs.simpleLeadSheet);
				var cursor = new CursorModel(simpleSong.getComponent('notes'));
				var structEdition = new StructureEditionController(simpleSong, cursor);
				var barMng = simpleSong.getComponent('bars');
				noteMng = simpleSong.getComponent('notes');


				cursor.setPos(5); //set cursor in first note of 2nd bar
				assert.equal(noteMng.getNotes(5,9),"A/4-q,F/4-q,G/4-q,E/4-q");
				assert.equal(barMng.getTotal(),8);
				assert.equal(simpleSong.getSections()[0].getNumberOfBars(),8);

				//We change time singature to 3/8 in 2nd bar
				structEdition.setTimeSignature("3/8");
				assert.equal(noteMng.getNotes(5,11),"A/4-q,F/4-8,F/4-8,G/4-q,E/4-q,8r","after changing time signature, F is cut in 2 (they are tied)");
				assert.equal(barMng.getTotal(),10,'2 bars added as a result of changing 2nd bar to 3/8');
				assert.equal(simpleSong.getSections()[0].getNumberOfBars(),10);
				assert.equal(barMng.getBar(1).getTimeSignatureChange(),'3/8','in 2nd bar there is a time signature change to 3/8');
				assert.equal(barMng.getBar(4).getTimeSignatureChange(),'4/4','after adding 2 bars, in 4th bar we have set again a time signature change to 4/4');
				
				//We change time singature to 5/4 in 2nd bar
				cursor.setPos(cursor.getListLength()-1); //set cursor in last note
				assert.equal(noteMng.getNotes(noteMng.getTotal()-4,noteMng.getTotal()).toString(),'A/4-q,F/4-q,G/4-q,E/4-q','last 4 notes');
				structEdition.setTimeSignature("5/4");
				assert.equal(noteMng.getNotes(noteMng.getTotal()-5,noteMng.getTotal()).toString(),'A/4-q,F/4-q,G/4-q,E/4-q,qr','last 5 notes, we have added a rest to fit in 5/4');

			});

		}
	};
});