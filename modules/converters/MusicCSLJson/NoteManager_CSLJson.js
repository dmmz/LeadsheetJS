define(['modules/core/NoteModel'], function(NoteModel) {
	function NoteManager_CSLJson(MusicCSLJSON) {

	};

	NoteManager_CSLJson.prototype.musicCSLJson2SongModel = function(notes, song) {
		if (typeof notes !== "undefined") {
			for (var i in notes) {
				this.addNote(new NoteModel(notes[i]));
			}
		}
		this.setNotesBarNum(song);
		return this;
	};

	NoteManager_CSLJson.prototype.songModel2MusicCSLJson = function(songModel, from, to) {
		var notes = [];
		this.getNotes(from, to + 1).forEach(function(note) {
			notes.push(note.songModel2MusicCSLJson(songModel));
		});
		return notes;
	};
	return NoteManager_CSLJson;
});
