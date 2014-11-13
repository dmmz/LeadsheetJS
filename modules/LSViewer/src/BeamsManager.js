define(['vexflow'], function(Vex) {
	function BeamsManager() {
		this.beams = [];
		this.counter = -1;		
	}
	BeamsManager.prototype.checkBeam = function(noteMng,iNote,noteView) {
		// body.console.log(noteView.isBeamable());
		if (!noteMng.isSameBeatAsPreviousNote(iNote)) {
			this.counter++;
			this.beams[this.counter] = [];
		}
		if (noteView.isBeamable()) {
			this.beams[this.counter].push(noteView.getVexflowNote());
		}
	};

	BeamsManager.prototype.getVexflowBeams = function() {
		var vexflowBeams = [];
		for (var j = 0; j < this.beams.length; j++) {
			if (this.beams[j] && this.beams[j].length > 1)
				vexflowBeams[j] = new Vex.Flow.Beam(this.beams[j], true); //auto_stem true
			else vexflowBeams[j] = null;
		}
		return vexflowBeams;
	};

	BeamsManager.prototype.draw = function(ctx,vxfBeams) {
		
		for (var j = 0; j < vxfBeams.length; j++) {
			if (vxfBeams[j] !== null) vxfBeams[j].setContext(ctx).draw();
		}
	};
	return BeamsManager;
});