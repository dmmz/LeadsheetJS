define(['vexflow'], function(Vex) {
	function LSBarView(barDimensions) {
		this.vexflowStave = new Vex.Flow.Stave(barDimensions.left, barDimensions.top, barDimensions.width);
	}
	LSBarView.prototype.draw = function(ctx, songIt) {
		if (songIt.getBarIndex() == 0) {
			this.vexflowStave.addClef("treble").setContext(ctx).draw();			
		}

		
		
		var keySignature = songIt.getBarTonality();
		
		if (keySignature != songIt.prevKeySig) {
			console.log("keySignature "+keySignature);
			console.log("songIt.prevKeySig "+songIt.prevKeySig);

			this.vexflowStave.addKeySignature(keySignature);
		}

		this.vexflowStave.setContext(ctx).draw();
	};
	// LSBarView.prototype.setKeySignature = function(prevKeySignature) {
	// 	this.keySignature = song.getTonalityAt(this.numBar);
		
	// };
	LSBarView.prototype.getKeySignature = function() {
		return this.keySignature;
	};
	LSBarView.prototype.getVexflowStave = function() {
		return this.vexflowStave;
	};


	return LSBarView;
});