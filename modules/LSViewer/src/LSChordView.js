define(['vexflow'], function(Vex) {
	/**
    * LSChordView is a module called by LSViewer to draw chords
    * @exports LSViewer/LSChordView
    */
	function LSChordView(chord, color) {
		this.color = color || "#000";
		this.chord = chord;
	}
	LSChordView.prototype.draw = function(ctx, barDimensions, timeSig, chordsY, fontChords) {
		if (!fontChords){
			throw "LSChordView - missing params";
		}
		function getChordX (beat, barDimensions, beatWidth) {
			var zeroBasedBeat = beat - 1;
			return barDimensions.left + zeroBasedBeat * beatWidth;
		}
		var beatWidth = barDimensions.width / timeSig.getBeats();

		ctx.font = fontChords; // font for chords
		ctx.textBaseline = "top"; // font for chords
		ctx.fillStyle = this.color;
		var chordX = getChordX(this.chord.getBeat(),barDimensions,beatWidth);

		ctx.fillText(this.chord.toString(), chordX, barDimensions.top - chordsY);
		ctx.fillStyle = "black";
		ctx.textBaseline = "alphabetic"; // font for chords
	};

	return LSChordView;
});