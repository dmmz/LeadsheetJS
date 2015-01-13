define(['vexflow'], function(Vex) {
	function LSBarView(barDimensions) {
		this.vexflowStave = new Vex.Flow.Stave(barDimensions.left, barDimensions.top, barDimensions.width);
	}
	LSBarView.prototype.draw = function(ctx, songIt, sectionIt, endingsY) {
		if (songIt.getBarIndex() == 0) {
			this.vexflowStave.addClef("treble").setContext(ctx).draw();
		}

		var keySignature = songIt.getBarKeySignature();
		if (keySignature != songIt.prevKeySig) {
			this.vexflowStave.addKeySignature(keySignature);
		}

		var timeSignature = songIt.getBarTimeSignature();
		if (timeSignature != songIt.prevTimeSig) {
			this.vexflowStave.addTimeSignature(timeSignature.toString());
		}

		var bar = songIt.getBar(),
			followingBar = songIt.getFollowingBar(),
			ending = bar.getEnding();

		if (ending) {
			songIt.setEndingState(followingBar.getEnding() ? 'BEGIN_END' : 'BEGIN');
			this.vexflowStave.setVoltaType(Vex.Flow.Volta.type[songIt.getEndingState()], ending + ".", endingsY);
		} else {

			if (songIt.getEndingState() != null) {
				if (sectionIt.isLastBar() || followingBar.getEnding()) {
					songIt.setEndingState('END');
					if (!sectionIt.isLastBar()){
						this.vexflowStave.setEndBarType(Vex.Flow.Barline.type.REPEAT_END);
					}	
					this.vexflowStave.setVoltaType(Vex.Flow.Volta.type[songIt.getEndingState()], ending + ".", endingsY);
					songIt.setEndingState(null);
				} else if (songIt.getEndingState() == 'BEGIN' || songIt.getEndingState() == 'MID') {
					songIt.setEndingState('MID');
					this.vexflowStave.setVoltaType(Vex.Flow.Volta.type[songIt.getEndingState()], ending + ".", endingsY);
				}
			}
		}
		if (sectionIt.isLastBar()) {
			this.vexflowStave.setEndBarType(Vex.Flow.Barline.type.END);
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