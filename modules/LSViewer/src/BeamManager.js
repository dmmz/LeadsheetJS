define(['vexflow', 'modules/LSViewer/src/LSNoteView',], function(Vex, LSNoteView) {
	/**
    * 
    * @exports LSViewer/BeamManager
    */
	function BeamManager() {
		this.beams = []; //array of arrays of vexflow notes, each array of vxfNotes represents a beam group
		this.counter = 0;
		this.lastNoteBeat = -1;
	}

	BeamManager.prototype.setBeamIndexes = function(barNotes, tupletMng, offsetIndex) {
		var noteView;
		var index;
		var tuplet = false;
		for (var i = 0; i < barNotes.length; i++) {
			noteView = new LSNoteView(barNotes[i]);
			//index = offsetIndex + i;
			if (tupletMng.isNewTuplet(i)){
				tuplet = true;
			}
			if (!tuplet.inTuplet(i)){
				tuplet = false;
			}
			
		}
		
		
	};

	/**
	 * saves information for later drawing beams: it is set in this.beams
	 * @param  {NoteManagerModel} noteMng
	 * @param  {Number} iNote    index of note
	 * @param  {LSNoteView} noteView
	 * @param  {Boolean} openTuplet true if note in 'iNote' is inside a tuplet, this allows us to beam together tuplets that exceed on beat; e.g. an 8th note septet (occupies 2 beats)
	 */
	BeamManager.prototype.checkBeam = function(noteMng, iNote, noteView, tupletMng) {

		/**
		 * isSameBeat: for now we just consider beaming at quarter beat level (in the future we may decide beaming level dependign on time signature )
		 * @param  {Number}  beat1
		 * @param  {Number}  beat2
		 * @return {Boolean}
		 */
		function isSameBeat(beat1, beat2) {
			return Math.floor(beat1) == Math.floor(beat2);
		}

		var noteBeat;
		if (noteView.isBeamable()) {

			noteBeat = noteMng.getNoteBeat(iNote);
			//new position for beam array when they are not in same beat
			if (tupletMng.isNewTuplet(iNote) || !isSameBeat(noteBeat, this.lastNoteBeat) && !tupletMng.inTuplet(iNote)) {
				//we create new beam
				this.beams[this.counter + 1] = [];
				this.counter++;
			}
			console.log(this.beams);
			var vexflowNote = noteView.getVexflowNote();
			this.beams[this.counter].push(vexflowNote);
			this.lastNoteBeat = noteBeat;
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
	BeamManager.prototype.draw = function(ctx, vxfBeams) {
		for (var j = 0, c = vxfBeams.length; j < c; j++) {
			if (vxfBeams[j] !== null) vxfBeams[j].setContext(ctx).draw();
		}
	};

	return BeamManager;
});