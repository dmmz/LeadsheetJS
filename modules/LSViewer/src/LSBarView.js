define(['vexflow'], function(Vex) {
	function LSBarView(barDimensions) {
		this.vexflowStave = new Vex.Flow.Stave(barDimensions.left, barDimensions.top, barDimensions.width);
	}
	LSBarView.prototype.draw = function(ctx, songIt, sectionIt, endingsY, labelsY) {
		if (songIt.getBarIndex() === 0) {
			this.vexflowStave.addClef("treble").setContext(ctx).draw();
		}
		//name section
		if (sectionIt.getBarIndex() === 0) {
			var nameSection = sectionIt.getSection().getName();
			if (nameSection !== "") {
				this.vexflowStave.setSection(nameSection, 9);
			}
		}

		//Bar number
		var drawStavesNumber = true;
		if (drawStavesNumber === true) {
			ctx.font = "10px Verdana"; // font for staves number
			ctx.fillStyle = "#900";
			var position = this.getVexflowStave();
			ctx.fillText(songIt.getBarIndex() + 1, position.x + 3, position.y + 37);
			ctx.fillStyle = "#000";
			ctx.font = "18px Verdana";
		}

		var keySignature = songIt.getBarKeySignature();
		if (keySignature != songIt.prevKeySig) {
			this.vexflowStave.addKeySignature(keySignature);
		}

		var timeSignature = songIt.getBarTimeSignature();
		if (timeSignature.toString() != songIt.prevTimeSig) {
			this.vexflowStave.addTimeSignature(timeSignature.toString());
		}

		var bar = songIt.getBar(),
			followingBar = songIt.getFollowingBar(),
			ending = bar.getEnding();
		//endings
		if (ending) {
			songIt.setEndingState(followingBar.getEnding() ? 'BEGIN_END' : 'BEGIN');
			this.vexflowStave.setVoltaType(Vex.Flow.Volta.type[songIt.getEndingState()], ending + ".", endingsY);
		} else {

			if (songIt.getEndingState() != null) {
				if (sectionIt.isLastBar() || followingBar.getEnding()) {
					songIt.setEndingState('END');
					if (!sectionIt.isLastBar()) {
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

		var label = bar.getLabel();
		if (label === 'coda' || label === 'coda2') {
			this.vexflowStave.setRepetitionTypeRight(Vex.Flow.Repetition.type.CODA_RIGHT, labelsY);
		}
		if (label === 'segno' || label === 'segno2') {
			this.vexflowStave.setRepetitionTypeRight(Vex.Flow.Repetition.type.SEGNO_RIGHT, labelsY);
		}
		var sublabel = bar.getSublabel(true);
		if (sublabel != null) {
			this.vexflowStave.setRepetitionTypeRight(Vex.Flow.Repetition.type[sublabel], labelsY);
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