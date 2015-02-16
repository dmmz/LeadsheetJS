define([
		'vexflow',
		'modules/LSViewer/src/LSNoteView',
		'modules/LSViewer/src/LSChordView',
		'modules/LSViewer/src/LSBarView',
		'modules/LSViewer/src/BeamManager',
		'modules/LSViewer/src/TieManager',
		'modules/LSViewer/src/TupletManager',
		'modules/LSViewer/src/BarWidthManager',
		'modules/core/src/SectionBarsIterator',
		'modules/core/src/SongBarsIterator'
	],
	function(Vex, LSNoteView, LSChordView, LSBarView, BeamManager, TieManager, TupletManager, BarWidthManager, SectionBarsIterator, SongBarsIterator) {

		function LSViewer(ctx, params) {
			this.ctx = ctx;
			this.init(params);
			this.drawableModel = [];
		}

		LSViewer.prototype.init = function(params) {
			this.SCALE = 0.85;
			this.NOTE_WIDTH = 20; /* estimated note width in order to be more flexible */
			this.LINE_HEIGHT = 150;
			this.LINE_WIDTH = 1160;
			this.BARS_PER_LINE = 4;

			this.ENDINGS_Y = 20; //0 -> thisChordsPosY==40, the greater the closer to stave 
			this.LABELS_Y = 0; //like this.ENDINGS_Y
			this.MARGIN_TOP = 100;
			this.CHORDS_DISTANCE_STAVE = 20; //distance from stave

			// this.marginLeft = 10;
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

		/**
		 * Add a model that contain a draw function, this function will be call in the draw function
		 * @param {object} model  should contain a draw function that will be call
		 * @param {int} zIndex Notes and chords are on zIndex 10, if you want to draw before then use zIndex < 10 or after use z index > 10
		 */
		LSViewer.prototype.addDrawableModel = function(model, zIndex) {
			if (typeof model === "undefined") {
				return;
			}
			if (typeof zIndex === "undefined") {
				zIndex = 11; // default value
			}
			this.drawableModel.push({
				'elem': model,
				'zIndex': zIndex
			});
			this.sortDrawableModel();
		};

		LSViewer.prototype.removeDrawableModel = function(model) {
			for (var i = 0, c = this.drawableModel.length; i < c; i++) {
				if (this.drawableModel[i].elem === model) {
					this.drawableModel[i].slice(i, 1);
					return;
				}
			}
		};

		LSViewer.prototype.sortDrawableModel = function(model, zIndex) {
			this.drawableModel.sort(function(a, b) {
				if (a.zIndex < b.zIndex)
					return -1;
				if (a.zIndex > b.zIndex)
					return 1;
				return 0;
			});
		};

		/**
		 *
		 * @param  {CursorModel  | [Integer, Integer] } cursor can be a CursorModel or an array with initial position and end position
		 * @param  {Array of NoteModel} notes
		 * @param  {Boolean} scale  indicates if we have to scale or not (from the viewer we don't need to because the whole view is scaled, but
		 *                   drawing from the interactiveLayer we do need to (harmonic analysis and annotation)
		 * @return {Array of Objects}, Object in this form: {area.x, area.y, area.xe, area.ye}
		 */
		/*LSViewer.prototype.getAreasFromCursor = function(cursor, notes, scale) {
			if (scale == null) scale = false;
			var areas = [];

			var cInit, cEnd;
			if (cursor instanceof CursorModel) {
				cInit = cursor.getStart();
				cEnd = cursor.getEnd();
			} else {
				cInit = cursor[0];
				cEnd = cursor[1];
			}
			//var initMeasure=this.mapNotesMeasures[cInit];
			cInit = parseInt(cInit, null);
			cEnd = parseInt(cEnd, null);
			var xi, yi, xe, ye;
			ye = this.cursorHeight;
			var firstNoteLine, lastNoteLine;
			var currY, nextY;

			firstNoteLine = notes[cInit];
			if (typeof firstNoteLine === "undefined") {
				return areas;
			}

			measureFirstNoteLine = notes[cInit].getMeasure();

			var iNote = cInit;
			while (iNote <= cEnd) {
				iMeasure = notes[iNote].getMeasure();

				currY = this.staves[iMeasure].y + this.marginCursor;

				//getNextY
				if (iNote == cEnd) //when there is only one note
					nextY = currY + this.marginCursor;
				else
					nextY = this.staves[notes[iNote + 1].getMeasure()].y + this.marginCursor;

				if (currY != nextY || iNote == cEnd) {
					lastNoteLine = notes[iNote];

					xi = firstNoteLine.x;
					xe = lastNoteLine.x - xi + lastNoteLine.width + this.cursorMarginRight;

					areas.push({
						x: xi,
						y: currY,
						xe: xe,
						ye: ye
					});

					if (iNote != cEnd) {
						firstNoteLine = notes[iNote + 1];
						measureFirstNoteLine = notes[iNote + 1].getMeasure();
					}
				}

				iNote++;
			}
			return scale ? this.scaleAreas(areas) : areas;
		};*/

		LSViewer.prototype.draw = function(song) {
			this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

			// call drawable elem with zIndex < 10
			for (var i = 0, c = this.drawableModel.length; i < c; i++) {
				if (this.drawableModel[i].zIndex < 10 && typeof this.drawableModel[i].elem.draw === "function") {
					this.drawableModel[i].elem.draw();
				}
			}
			// this.ctx.translate((this.ctx.canvas.width - (this.ctx.canvas.width * this.SCALE)) / 2, 0);
			// this.ctx.scale(this.SCALE, this.SCALE);

			var numBar = 0,
				self = this,
				nm = song.getComponent("notes"),
				cm = song.getComponent("chords"),
				barNotes,
				barChords,
				beamMng,
				tupletMng,
				bar,
				noteView,
				chordView,
				iNote = 0,
				stave,
				vxfBeams,
				vxfNote,
				vxfNotes = [],
				barDimensions,
				tieMng = new TieManager();

			var barWidthMng = new BarWidthManager(this.LINE_HEIGHT, this.LINE_WIDTH, this.NOTE_WIDTH, this.BARS_PER_LINE, this.MARGIN_TOP);
			barWidthMng.calculateBarsStructure(song, nm);
			var numSection = 0;

			var songIt = new SongBarsIterator(song);
			song.getSections().forEach(function(section) {

				// for each bar
				var sectionIt = new SectionBarsIterator(section);
				while (sectionIt.hasNext()) {

					beamMng = new BeamManager();
					tupletMng = new TupletManager();
					bar = [];

					barNotes = nm.getNotesAtBarNumber(songIt.getBarIndex(), song);
					
					// for each note of bar
					for (var j = 0; j < barNotes.length; j++) {
						tieMng.checkTie(barNotes[j], iNote);
						tupletMng.checkTuplet(barNotes[j], iNote);
						noteView = new LSNoteView(barNotes[j]);
						beamMng.checkBeam(nm, iNote, noteView);
						vxfNote = noteView.getVexflowNote();
						bar.push(vxfNote);
						vxfNotes.push(vxfNote);
						iNote++;
					}

					barDimensions = barWidthMng.getDimensions(songIt.getBarIndex());
					var barView = new LSBarView(barDimensions);
					barView.draw(self.ctx, songIt, sectionIt, self.ENDINGS_Y, self.LABELS_Y);

					barChords = cm.getChordsByBarNumber(songIt.getBarIndex());
					for (var i = 0; i < barChords.length; i++) {
						chordView = new LSChordView(barChords[i]).draw(
							self.ctx,
							barDimensions,
							songIt.getBarTimeSignature(),
							self.CHORDS_DISTANCE_STAVE);
					}

					vxfBeams = beamMng.getVexflowBeams(); // we need to do getVexflowBeams before drawing notes
					Vex.Flow.Formatter.FormatAndDraw(self.ctx, barView.getVexflowStave(), bar, {
						autobeam: false
					});

					beamMng.draw(self.ctx, vxfBeams); // and draw beams needs to be done after drawing notes
					tupletMng.draw(self.ctx, vxfNotes);
					songIt.next();
					sectionIt.next();
				}
				numSection++;
			});
			tieMng.draw(self.ctx, vxfNotes, nm, barWidthMng, song);
			self.vxfNotes = vxfNotes;

			// call drawable elem with zIndex > 10
			for (var i = 0, c = this.drawableModel.length; i < c; i++) {
				if (this.drawableModel[i].zIndex >= 10 && typeof this.drawableModel[i].elem.draw === "function") {
					this.drawableModel[i].elem.draw(self);
				}
			}
		};
		return LSViewer;

	});