define(['vexflow'], function(Vex) {
	/**
	 * LSBarView is a module called by LSViewer to draw tuplet notes
	 * @exports LSViewer/TupletManager
	 */
	function TupletManager() {
		this.tuplets = [];
		this.numTuplets = 0;
		this.prevTieType = null;
	}
	/**
	 * saves information for drawing tuplets later
	 * @param  {NoteModel} note  
	 * @param  {Number} iNote index of note
	 */
	TupletManager.prototype.checkTuplet = function(note, iNote) {

		var tuplet = note.getTuplet(),
			isTuplet;
		if (tuplet != null) {
			if (tuplet == 'start') {
				isTuplet = 1;
				this.numTuplets++;
				this.tuplets[this.numTuplets] = [];
				this.tuplets[this.numTuplets][0] = iNote;
			} else if (tuplet == 'stop') { //'stop'
				this.tuplets[this.numTuplets][1] = iNote;
			}
		}
	};
	/**
	 * @param  {Context} ctx          
	 * @param  {Array} noteViews Array of Vex.Flow.StaveNote
	 */
	TupletManager.prototype.draw = function(ctx, noteViews) {
		function convertToVxfNotes (noteViews) {
			var vxfNotes = [];
			for (var i in noteViews){
				vxfNotes.push(noteViews[i].getVexflowNote());
			}
			return vxfNotes;
		}
		var vexflowTuplet,
		tupletNotes;
		for (var i in this.tuplets) {
			tupletNotes = noteViews.slice(this.tuplets[i][0], this.tuplets[i][1] + 1);
			vexflowTuplet = new Vex.Flow.Tuplet(convertToVxfNotes(tupletNotes));
			vexflowTuplet.setContext(ctx).draw();
		}
	};


	return TupletManager;
});