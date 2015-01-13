define(['modules/core/src/NoteModel'], function(NoteModel) {
	var NoteManager_CSLJson = {};

	NoteManager_CSLJson.importFromMusicCSLJSON = function(notes, song) {
		if (typeof notes !== "undefined") {
			for (var i in notes) {
				this.addNote(new NoteModel(notes[i]));
			}
		}
		this.setNotesBarNum(song);
		return this;
	};
	/*  TODO: test does not exist */
	NoteManager_CSLJson.exportToMusicCSLJSON = function(noteManager, from, to) {
		var notes = [];
		noteManager.getNotes(from, to + 1).forEach(function(note) {
			notes.push(note.exportToMusicCSLJSON(songModel));
		});
		return notes;
	};
	return NoteManager_CSLJson;
});
