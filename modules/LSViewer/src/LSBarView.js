define(['vexflow'], function(Vex) {
	function LSBarView(barDimensions, iBar) {
		this.vexflowStave = new Vex.Flow.Stave(barDimensions.left, barDimensions.top, barDimensions.width);
		this.numBar = iBar;
	}
	LSBarView.prototype.draw = function(ctx) {
		if (this.numBar == 0) {
			this.vexflowStave.addClef("treble").setContext(ctx).draw();
		}
		this.vexflowStave.setContext(ctx).draw();
	};
	LSBarView.prototype.getVexflowStave = function() {
		return this.vexflowStave;
	};


	return LSBarView;
});