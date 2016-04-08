define(['vexflow'], function(Vex) {
	/**
    * LSChordView is a module called by LSViewer to draw chords
    * @exports LSViewer/LSChordView
    */
	function LSChordView(chord, color) {
		this.color = color || "#000";
		this.chord = chord;
	}
	/**
	 * @param  {CanvasContext} ctx           
	 * @param  {Object} barDimensions e.g. {x:1, y:1, w:2, h:2}
	 * @param  {TimeSignatureModel} timeSig       
	 * @param  {Number} chordsY       
	 * @param  {String} fontChords    
	 * @param  {Number} marginLeft    
	 * @param  {Function} boundingBoxFn returns bounding box of drawed chord, i.e. an object like {x:1, y:1, w:2, h:2}
	 * @return {Object}               returns bounding box if function is sent (i.e. when LSViewer.SAVE_CHORDS === true)
	 */
	LSChordView.prototype.draw = function(ctx, barDimensions, timeSig, chordsY, fontChords, marginLeft, boundingBoxFn) {
		if (!fontChords){
			throw "LSChordView - missing params";
		}
		function getChordX (beat, barDimensions, beatWidth) {
			var zeroBasedBeat = beat - 1;
			return barDimensions.left + marginLeft + zeroBasedBeat * beatWidth;
		}
		var beatWidth = (barDimensions.width - marginLeft) / timeSig.getBeats();
		
		var oldBaseline = ctx.textBaseline,
			oldFillStyle = ctx.fillStyle,
			oldFont = ctx.font;
	
		ctx.textBaseline = "top"; // font for chords
		ctx.font = fontChords; 
		ctx.fillStyle = this.color;

		var chordX = getChordX(this.chord.getBeat(), barDimensions, beatWidth)
		ctx.fillText(this.chord.toString(), chordX, barDimensions.top - chordsY);
		var	boundingBox = boundingBoxFn ? boundingBoxFn(ctx, this.chord.toString(), chordX, barDimensions.top - chordsY) : undefined;
		
		ctx.textBaseline = oldBaseline;
		ctx.font = oldFont;
		ctx.fillStyle = oldFillStyle;

		return boundingBox;	

	};

	return LSChordView;
});