define(['vexflow', 
		'modules/LSViewer/src/LSNoteView', 
		'modules/LSViewer/src/BeamManager',
		'modules/LSViewer/src/TieManager',
		'modules/LSViewer/src/TupletManager'
		], 
		function(Vex, LSNoteView, BeamManager,TieManager,TupletManager) {

	function LSViewer(ctx, params) {
		this.ctx = ctx;
		this.init(params);
	}
	LSViewer.prototype.init = function(params) {
		this.SCALE = 0.85;
		this.NOTE_WIDTH = 10; /* estimated note width in order to be more flexible */
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
	/*	LSViewer.prototype.drawStave = function(section,i) {
		var left = this.marginLeft + this.barWidth * this.xMeasure;
		var top = this.marginTop + this.yMeasure * this.lineHeight;
		console.log(left+" "+top+" "+this.barWidth);
		var stave = new Vex.Flow.Stave(0, 0, this.totalWidth);
		stave.setContext(this.ctx).draw();
		stave.drawVerticalBar(this.barWidth);
	};
	LSViewer.prototype.drawSection = function(section) {
		stave = this.drawStave(section,0);

	};*/

	LSViewer.prototype.draw = function(song) {
		this.currTimeSig = null;

		this.keySig = song.getTonality();
		this.timeSig = song.getTimeSignature();

		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.ctx.scale(this.SCALE, this.SCALE);

		var numBar = 0,
			self = this,
			nm = song.getComponent("notes"),
			barNotes,
			beamMng,
			tupletMng,
			bar,
			noteView,
			iNote = 0,
			stave,
			vxfBeams,
			vxfNote,
			vxfNotes = [],
			tieMng = new TieManager();

		song.getSections().forEach(function(section) {

			for (var i = 0; i < section.numberOfBars; i++) {

				beamMng = new BeamManager();
				tupletMng = new TupletManager();
				bar = [];

				barNotes = nm.getNotesAtBarNumber(i, song);

				for (var j = 0; j < barNotes.length; j++) {
					tieMng.checkTie(barNotes[j],iNote);
					tupletMng.checkTuplet(barNotes[j],iNote);
					noteView = new LSNoteView(barNotes[j]);
					vxfNote = noteView.getVexflowNote();
					bar.push(vxfNote);
					vxfNotes.push(vxfNote);
					beamMng.checkBeam(nm, iNote, noteView);
					iNote++;
				}
				stave = new Vex.Flow.Stave(i * 200, 0, 200);
				stave.setContext(self.ctx).draw();
				vxfBeams = beamMng.getVexflowBeams(); // we need to do getVexflowBeams before drawing notes
				Vex.Flow.Formatter.FormatAndDraw(self.ctx, stave, bar, {
					autobeam: false
				});
				beamMng.draw(self.ctx, vxfBeams); // and draw beams needs to be done after drawing notes
				tupletMng.draw(self.ctx,vxfNotes)
			}
		});
		tieMng.draw(self.ctx,vxfNotes);

	};
	return LSViewer;
});