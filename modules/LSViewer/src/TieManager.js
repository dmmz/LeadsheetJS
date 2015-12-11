define(['vexflow'], function(Vex) {
	/**
	 * LSBarView is a module called by LSViewer to draw tie notes
	 * @exports LSViewer/TieManager
	 */
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
	 * @param  {Array} noteViews of LSNoteView
	 * @param  {NoteManagerModel} nm
	 */
	TieManager.prototype.draw = function(ctx, noteViews, nm, barWidthMng, song) {

		function drawTie(note1, note2) {
			var vxTie = new Vex.Flow.StaveTie({
				first_note: note1,
				last_note: note2
			});
			vxTie.setContext(ctx);
			vxTie.draw();
		}
		var iNoteTieStart,
			iNoteTieEnd,
			iTieStartBar,
			iTieEndBar,
			auxStartNote;

		for (var i in this.ties) {
			iNoteTieStart = this.ties[i][0];
			iNoteTieEnd = this.ties[i][1];

			auxStartNote = noteViews[iNoteTieStart].getVexflowNote();

			iTieStartBar = nm.getNoteBarNumber(iNoteTieStart, song);
			iTieEndBar = nm.getNoteBarNumber(iNoteTieEnd, song);

			if (!barWidthMng.inSameLine(iTieStartBar, iTieEndBar)) {
				drawTie(auxStartNote, null);
				auxStartNote = null;
			}
			drawTie(auxStartNote, noteViews[iNoteTieEnd].getVexflowNote());

		}
	};


	return TieManager;
});