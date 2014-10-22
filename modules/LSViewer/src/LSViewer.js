define(['vexflow'], function(Vex){
	function LSViewer(ctx,params){
		this.ctx = ctx;
		this.init(params);
	}
	LSViewer.prototype.init = function(params) {
		this.SCALE = 0.85;
		this.totalWidth = 1160;
		this.marginLeft = 10;
		this.marginTop = 100; 
		this.lineHeight = 150;
		this.chordsPosY = 40; //distance from stave
		this.endingsY = 20; //0 -> thisChordsPosY==40, the greater the closer to stave
		this.labelsY = 0; //like this.endingsY
		this.barsPerLine = 4;
		this.barWidth = this.totalWidth / this.barsPerLine;
		this.clef = "treble";

	};
	LSViewer.prototype.drawStave = function(section,i) {
		var left = this.marginLeft + this.barWidth * this.xMeasure;
		var top = this.marginTop + this.yMeasure * this.lineHeight;
		console.log(left+" "+top+" "+this.barWidth);
		var stave = new Vex.Flow.Stave(0, 0, this.totalWidth);
		stave.setContext(this.ctx).draw();
		stave.drawVerticalBar(this.barWidth);
	};
	LSViewer.prototype.drawSection = function(section) {
		stave = this.drawStave(section,0);

		/*for (var i = 0; i < section.getNumberOfBars(); i++) {
			stave = this.drawStave(section,i);
		//	this.staves.push(stave);	
		};*/
	};
	LSViewer.prototype.draw = function(song) {
		this.currTimeSig = null;
		
		
		this.keySig = song.getTonality();
		this.timeSig = song.getTimeSignature();
		

		
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.ctx.scale(this.SCALE, this.SCALE);
		

		var self = this;
		// song.getSections().forEach(function(section){
		// 	self.drawSection(section);
		// });
		var stave = new Vex.Flow.Stave(0, 0, this.totalWidth);
		stave.setContext(this.ctx).draw();
		
		Vex.Flow.Formatter.FormatAndDraw(this.ctx, this.staves[i], this.measures[i], false); //autobeam false
	};
	return LSViewer;
});