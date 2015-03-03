define(['vexflow', 'modules/converters/MusicCSLJson/src/NoteModel_CSLJson'], function(Vex, NoteModel_CSLJson) {
	function LSNoteView(note) {
		this.vexflowNote = createVexflowNote(note);
		this.note = note;


		/**
		 * @param  {NoteModel} note
		 * @return {Vex.Flow.StaveNote}
		 */
		function createVexflowNote(note) {
			var vexflowNote = new Vex.Flow.StaveNote(NoteModel_CSLJson.exportToMusicCSLJSON(note));
			var i;
			//var vexflowNote = new Vex.Flow.StaveNote({keys: ["c/4", "e/4", "g/4"], duration: "q" });
			//control stem direction
			if (parseInt(vexflowNote.keyProps[0].octave, null) >= 5) {
				vexflowNote.setStemDirection(-1);
			}

			var accidental = [];
			for (i = 0; i < note.numPitches; i++) {
				accidental.push(note.getAccidental(i));
			}
			//accidental can either be a string (for monphony) or an array (for polyphony)
			for (var acc in accidental) {
				if (accidental[acc] != null && accidental[acc].length != 0)
					vexflowNote.addAccidental(acc, new Vex.Flow.Accidental(accidental[acc]));
			}
			var dot = note.getDot();

			if (dot) {
				for (i = 0; i < dot; i++) vexflowNote.addDot(0);
			}
			return vexflowNote;
		}

	}
	LSNoteView.prototype.getVexflowNote = function() {
		return this.vexflowNote;
	};
	LSNoteView.prototype.isBeamable = function() {
		return (/^\d+$/).test(this.vexflowNote.duration) && !this.note.isRest;
	};
	return LSNoteView;
});