define(['vexflow','underscore'], function(Vex,_) {
	/**
	 * LSBarView is a module called by LSViewer to draw tuplet notes
	 * @exports LSViewer/TupletManager
	 */
	function TupletManager() {
		this.tuplets = [];
		this.timeModifs = [];
		this.numTuplets = 0;
		this.prevTieType = null;
		this.openTuplet = false; // is set true after a tuplet note 'start' and set false on note 'stop', it is used later to beam notes

	}
	/**
	 * called for each note in a bar
	 * @param  {NoteModel} note  
	 * @param  {Number} iNote index of note
	 */
	TupletManager.prototype.checkTuplet = function(note, iNote) {
		function parseTimeModif(timeModif) {
			var parts = timeModif.split("/");
			return {
				num_notes: parts[0],
				notes_occupied: parts[1]
			};
		}

		var tuplet = note.getTuplet();
		if (tuplet != null) {
			if (tuplet == 'start') {
				this.numTuplets++;
				this.tuplets[this.numTuplets] = [];
				this.timeModifs[this.numTuplets] = parseTimeModif(note.getTimeModification());
				this.tuplets[this.numTuplets][0] = iNote;
			} else if (tuplet == 'stop' && this.tuplets[this.numTuplets]) { //'stop'
				this.openTuplet = false;
				this.tuplets[this.numTuplets][1] = iNote;
			}
			else{
				this.openTuplet = true;
			}
		}
	};
	/**
	 * @param  {Context} ctx          
	 * @param  {Array} noteViews Array of Vex.Flow.StaveNote
	 */
	TupletManager.prototype.draw = function(ctx, noteViews) {
		function convertToVxfNotes(noteViews) {
			var vxfNotes = [];
			for (var i in noteViews) {
				vxfNotes.push(noteViews[i].getVexflowNote());
			}
			return vxfNotes;
		}
		var vexflowTuplet,
			tupletNotes;
		for (var i in this.tuplets) {
			tupletNotes = convertToVxfNotes(noteViews.slice(this.tuplets[i][0], this.tuplets[i][1] + 1));
			if (tupletNotes && tupletNotes.length) {
				//vexflowTuplet = new Vex.Flow.Tuplet(tupletNotes);
				vexflowTuplet = new Vex.Flow.Tuplet(tupletNotes, {
					notes_occupied: this.timeModifs[i].notes_occupied,
					num_notes: this.timeModifs[i].num_notes,
					ratioed: false
				});
				vexflowTuplet.setContext(ctx).draw();
			}
		}
	};

	TupletManager.prototype.inTuplet = function(iNote) {
		var r = false;
		_.each(this.tuplets, function(tuplet){
			if (tuplet && iNote <= tuplet[1] && iNote >= tuplet[0]){
				r = true;
			}
		});
		return r;
	};

	TupletManager.prototype.isNewTuplet = function(iNote) {
		var r = false;
		_.each(this.tuplets, function(tuplet){
			if (tuplet && iNote === tuplet[0]){
				r =  true;
			}
		});
		return r;
	};
	return TupletManager;
});