define(['tests/test-songs','modules/core/SongModel'], function(testSongs,SongModel) {
	return {
		run: function(){
			var song = new SongModel(testSongs.simpleLeadSheet);
/*
			var converter = new SongModel_CSLJSON();
			var song = converter.convert(testSongs.simpleLeadSheet);
*/
/*			var song new SongModel();
			var chordManager = new ChordManager();
			var chord = new ChordModel();
			chord.setNote("A");
			chord.setChordType("M");
			chordManager.insertChord(chord);
			..
			...
			..
			..
			var noteManager = new NoteManager();
			var note = new NoteModel();
			note.setPitch("A/4");
			noteManager.insertNote(note);
			var note2 = new NoteModel();
			note.setPitch("A/4");
			noteManager.insertNote(note);
			...
			..
			..

			
			song.addComponent(notes,noteManager);
			song.addComponent(chords,chordManager);

			// console.log(song.getTonality());
			// song.getComponent('bars').getBar(5).setTonality("Eb");*/
		}
	};
});