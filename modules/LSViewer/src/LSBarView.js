define(['vexflow'], function(Vex) {
	/**
    * LSBarView is a module called by CanvasLayer to draw bars
    * @exports LSViewer/LSBarView
    */
	function LSBarView(barDimensions, options) {
		this.vexflowStave = new Vex.Flow.Stave(barDimensions.left, barDimensions.top, barDimensions.width, options);
		this.drawClef = !!options.draw_clef;
		this.drawKeySignature = !!options.draw_key_signature;
		this.drawStaveNumbers = options.draw_stave_numbers === undefined ? true : !!options.draw_stave_numbers;
	}

	LSBarView.prototype.draw = function(ctx, songIt, sectionIt, endingsY, labelsY) {
		if (songIt.getBarIndex() === 0 && this.drawClef) {
			this.vexflowStave.addClef("treble").setContext(ctx).draw();
		}
		//name section
		if (sectionIt.getBarIndex() === 0) {
			var nameSection = sectionIt.getSection().getName();
			var repeatSection = parseInt(sectionIt.getSection().getRepeatTimes(), 10) + 1;
			var textRepeatSection = '';
			if (repeatSection > 1) {
				textRepeatSection += ' (x' + repeatSection + ')';
			}
			if (nameSection !== "") {
				this.vexflowStave.setSection(nameSection + textRepeatSection, 9);
			}
		}

		//Bar number
		if (this.drawStaveNumbers === true) {
			ctx.font = "10px Verdana"; // font for staves number
			ctx.fillStyle = "#900";
			var position = this.getVexflowStave();
			ctx.fillText(songIt.getBarIndex() + 1, position.x + 3, position.y + 37);
			ctx.fillStyle = "#000";
			ctx.font = "18px Verdana";
		}

		var keySignatureString = songIt.getBarKeySignature();
		if (keySignatureString != songIt.getPrevKeySignature() && this.drawKeySignature) {
			var keySignature = new Vex.Flow.KeySignature(keySignatureString);
			var prevKeySignature = songIt.getPrevKeySignature();
			// see https://github.com/0xfe/vexflow/issues/335
			if (prevKeySignature !== null && prevKeySignature !== "C") {
				keySignature.cancelKey(prevKeySignature);
			}
			keySignature.addToStave(this.vexflowStave);
		}

		var timeSignature = songIt.getBarTimeSignature();

		if (timeSignature.toString() != songIt.getPrevTimeSignature()) {
			this.vexflowStave.addTimeSignature(timeSignature.toString());
		}

		var bar = songIt.getBar(),
			followingBar = songIt.getFollowingBar(),
			ending = bar.getEnding();
		// endings
		if (ending) {
			songIt.setEndingState((sectionIt.isLastBar() || followingBar.getEnding()) ? 'BEGIN_END' : 'BEGIN');
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
		if (sectionIt.isLastBar()) {
			songIt.setEndingState(null);
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
	LSBarView.prototype.getKeySignature = function() {
		return this.keySignature;
	};
	LSBarView.prototype.getVexflowStave = function() {
		return this.vexflowStave;
	};


	return LSBarView;
});