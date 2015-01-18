define(['vexflow'], function(Vex) {
	function LSChordView(chord,color) {
		this.color = color || "#000";
		this.chord = chord;
	}
	LSChordView.prototype.draw = function(ctx, barDimensions, timeSig, chordsY) {

		function getChordX (beat, barDimensions, totalBeats) {
			var zeroBasedBeat = beat - 1;
			var beatWidth = barDimensions.width / totalBeats ;
			return barDimensions.left + zeroBasedBeat * beatWidth;
		}

		ctx.font = "18px Verdana"; // font for chords
		ctx.textBaseline = "middle"; // font for chords
		ctx.fillStyle = this.color;
		var chordX = getChordX(this.chord.getBeat(),barDimensions,timeSig.getBeatUnit())
		ctx.fillText(this.chord.toString(), chordX, barDimensions.top - chordsY);
		ctx.fillStyle = "black";
		ctx.textBaseline = "alphabetic"; // font for chords
	};

	return LSChordView;
});