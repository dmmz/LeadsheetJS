define(['vexflow'], function(Vex) {
	function BeamManager() {
		this.beams = [];
		this.counter = -1;		
	}
	/**
	 * saves information for later drawing beams
	 * @param  {NoteManagerModel} noteMng  
	 * @param  {Number} iNote    index of note
	 * @param  {LSNoteView} noteView 
	 */
	BeamManager.prototype.checkBeam = function(noteMng,iNote,noteView) {

		if (!noteMng.isSameBeatAsPreviousNote(iNote)) {
			this.counter++;
			this.beams[this.counter] = [];
		}

		if (noteView.isBeamable()) {
			this.beams[this.counter].push(noteView.getVexflowNote());
		}
	};
	/**
	 * 	@return {Array} Array of Vex.Flow.Beam (generate from information in array this.beams) needed to draw
	 */
	BeamManager.prototype.getVexflowBeams = function() {
		var vexflowBeams = [];
		for (var j = 0; j < this.beams.length; j++) {
			if (this.beams[j] && this.beams[j].length > 1)
				vexflowBeams[j] = new Vex.Flow.Beam(this.beams[j], true); //auto_stem true
			else vexflowBeams[j] = null;
		}
		return vexflowBeams;
	};

	/**
	 * 	draws beams
	 * @param  {Context} ctx     
	 * @param  {Array} vxfBeams  Array of Vex.Flow.Beam
	 */
	BeamManager.prototype.draw = function(ctx,vxfBeams) {
		for (var j = 0; j < vxfBeams.length; j++) {
			if (vxfBeams[j] !== null) vxfBeams[j].setContext(ctx).draw();
		}
	};

	return BeamManager;
});