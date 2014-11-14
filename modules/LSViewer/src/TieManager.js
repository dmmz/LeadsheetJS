define(['vexflow'], function(Vex) {
	function TieManager() {
		this.ties = [];
		this.numTies = 0;
		this.prevTieType = null;
	}
	/**
	 * saves information for drawing ties
	 * @param  {NoteModel} note  
	 * @param  {Number} iNote index of note
	 */
	TieManager.prototype.checkTie = function(note, iNote) {
		var tieType;

		if (note.isTie()) {
			tieType = note.getTie();
			if (tieType == "start") {

				this.ties[this.numTies] = [];
				this.ties[this.numTies].push(iNote);
			} else { // (tieType=="stop" || tieType=="stop_start"){ 

				if (this.prevTieType == "stop" || this.prevTieType === null) {

					this.ties[this.numTies] = [];
					this.ties[this.numTies].push(null);
				}
				this.ties[this.numTies].push(iNote);
				this.numTies++;
			}
			if (tieType == "stop_start") {

				this.ties[this.numTies] = [];
				this.ties[this.numTies].push(iNote);
			}
			this.prevTieType = tieType;
		}

	};
	/**
	 * @param  {Context} ctx          
	 * @param  {Array} vexflowNotes of Vex.Flow.StaveNote
	 */
	TieManager.prototype.draw = function(ctx, vexflowNotes) {

		function drawTie(note1, note2) {
			var vxTie = new Vex.Flow.StaveTie({
				first_note: note1,
				last_note: note2
			});
			vxTie.setContext(ctx);
			vxTie.draw();
		}
		var tieStartNote, 
		tieEndNote, 
		auxStartNote;
		
		for (var i in this.ties) {
			tieStartNote = this.ties[i][0];
			tieEndNote = this.ties[i][1];
			auxStartNote = vexflowNotes[tieStartNote];
			//TODO: treat measures that are not in same line
			// if (tieStartNote != null && tieEndNote != null && !this.measuresSameLine(notes[tieStartNote].getMeasure(), notes[tieEndNote].getMeasure())) {
			// 	this.drawTie(vexflowNotes[tieStartNote], null);
			// 	auxStartNote = null;
			// }
			
			drawTie(auxStartNote, vexflowNotes[tieEndNote]);
		}
	};


	return TieManager;
});