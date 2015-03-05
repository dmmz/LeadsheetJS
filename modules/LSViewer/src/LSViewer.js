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
		'modules/core/src/SongBarsIterator',
		'pubsub'
	],
	function(Vex, LSNoteView, LSChordView, LSBarView, BeamManager, TieManager, TupletManager, BarWidthManager, SectionBarsIterator, SongBarsIterator, pubsub) {

		function LSViewer(idDivContainer, params) {
			params = params || {};
			this.DEFAULT_HEIGHT = 1000;
			

			var idScore = "ls" + ($("canvas").length + 1),
			divContainer = $("#" + idDivContainer),
			width = params && params.width ? params.width : divContainer.width(),
			height = params && params.height ? params.height : this.DEFAULT_HEIGHT;


			//create canvas
			canvas = $("<canvas id='" + idScore + "'></canvas>");
			canvas[0].width = width * 0.8;
			canvas[0].height = height;
			canvas.appendTo(divContainer);

			if (canvas[0].height > divContainer.height()){
				divContainer.css({
					overflowY: "scroll",
					textAlign: "center"
				});
			}	

			this.canvas = canvas;
			var renderer = new Vex.Flow.Renderer(this.canvas[0], Vex.Flow.Renderer.Backends.CANVAS);
			this.ctx = renderer.getContext("2d");
			
			params.width = width*0.9;
			this.init(params);
			this.drawableModel = [];
			this.initController();
		}

		/**
		 * Publish event after receiving dom events
		 */
		LSViewer.prototype.initController = function() {
			var self = this;


			$(this.canvas).click(function(evt) {
				$.publish('LSViewer-click', getXandY($(self.canvas), evt));
			});
			$(this.canvas).mouseover(function(evt) {
				$.publish('LSViewer-mouseover', getXandY($(self.canvas), evt));
			});

			function getXandY(element, event) {
				xpos = event.pageX - element.offset().left;
				ypos = event.pageY - element.offset().top;
				return {
					x: xpos,
					y: ypos
				};
			}
		};

		LSViewer.prototype.init = function(params) {
			this.SCALE = 0.9;
			this.NOTE_WIDTH = 20; /* estimated note width in order to be more flexible */
			this.LINE_HEIGHT = 150;
			this.LINE_WIDTH = 1160;
			this.BARS_PER_LINE = 4;

			this.ENDINGS_Y = 20; //0 -> thisChordsPosY==40, the greater the closer to stave 
			this.LABELS_Y = 0; //like this.ENDINGS_Y
			this.MARGIN_TOP = 100;
			this.CHORDS_DISTANCE_STAVE = 20; //distance from stave

			// this.marginLeft = 10;
			if (params && params.width) {
				this.setWidth(params.width);
			}
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

		LSViewer.prototype.setWidth = function(width) {

			
			var viewerWidth = width || this.LINE_WIDTH;
			
			//this.SCALE = viewerWidth / this.LINE_WIDTH;
			this.SCALE = 0.9;

			this.LINE_WIDTH = viewerWidth;
		};


		/**
		 * Add a model that contains a draw function, this function will be called in the draw function
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
		 * Function return several areas to indicate which notes are selected, usefull for cursor or selection
		 * @param  {[Integer, Integer] } Array with initial position and end position
		 * @return {Array of Objects}, Object in this form: {area.x, area.y, area.xe, area.ye}
		 */
		LSViewer.prototype.getNotesAreasFromCursor = function(cursor) {
			var areas = [];
			var cInit = cursor[0];
			var cEnd = cursor[1];
			if (typeof this.vxfNotes[cInit] === "undefined") {
				return areas;
			}
			var xi, yi, xe, ye;
			ye = this.LINE_HEIGHT;

			var currentNote, currentNoteStaveY, nextNoteStaveY;
			var firstNoteLine, lastNoteLine;
			firstNoteLine = this.vxfNotes[cInit];
			while (cInit <= cEnd) {
				currentNote = this.vxfNotes[cInit];
				currentNoteStaveY = currentNote.stave.y;
				if (typeof this.vxfNotes[cInit + 1] !== "undefined") {
					nextNoteStaveY = this.vxfNotes[cInit + 1].stave.y;
				}
				if (currentNoteStaveY != nextNoteStaveY || cInit == cEnd) {
					lastNoteLine = currentNote.getBoundingBox();
					xi = firstNoteLine.getBoundingBox().x;
					xe = lastNoteLine.x - xi + lastNoteLine.w;
					areas.push({
						x: xi,
						y: currentNoteStaveY,
						xe: xe,
						ye: ye
					});
					if (cInit != cEnd) {
						firstNoteLine = this.vxfNotes[cInit + 1];
					}
				}

				cInit++;
			}
			return areas;
		};

		LSViewer.prototype._scale = function() {
			
			this.ctx.scale(this.SCALE, this.SCALE);
			this.ctx.translate((this.ctx.canvas.width * (1 -  this.SCALE)/2) , 0);
		};
		
		LSViewer.prototype._resetScale = function() {
			this.ctx.translate(-(this.ctx.canvas.width * (1 -  this.SCALE)/2) , 0);
			this.ctx.scale(1 / this.SCALE, 1 / this.SCALE);
		};

		LSViewer.prototype.draw = function(song) {

			this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
			this._scale();
			var i, j, v, c;
			// call drawable elem with zIndex < 10
			for (i = 0, c = this.drawableModel.length; i < c; i++) {
				if (this.drawableModel[i].zIndex < 10 && typeof this.drawableModel[i].elem.draw === "function") {
					this.drawableModel[i].elem.draw(self);
				}
			}
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
				vxfBars = [],
				barDimensions,
				tieMng = new TieManager();

			var barWidthMng = new BarWidthManager(this.LINE_HEIGHT, this.LINE_WIDTH, this.NOTE_WIDTH, this.BARS_PER_LINE, this.MARGIN_TOP, this.SCALE);
			barWidthMng.calculateBarsStructure(song, nm);
			var numSection = 0;

			var songIt = new SongBarsIterator(song);
			var barView;
			var sectionIt;
			song.getSections().forEach(function(section) {

				// for each bar
				sectionIt = new SectionBarsIterator(section);
				while (sectionIt.hasNext()) {

					beamMng = new BeamManager();
					tupletMng = new TupletManager();
					bar = [];

					barNotes = nm.getNotesAtBarNumber(songIt.getBarIndex(), song);

					// for each note of bar
					for (j = 0, v = barNotes.length; j < v; j++) {
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
					barView = new LSBarView(barDimensions);
					barView.draw(self.ctx, songIt, sectionIt, self.ENDINGS_Y, self.LABELS_Y);

					vxfBars.push({
						'barDimensions': barDimensions,
						'timeSignature': songIt.getBarTimeSignature(),
					});

					barChords = cm.getChordsByBarNumber(songIt.getBarIndex());
					for (i = 0, c = barChords.length; i < c; i++) {
						chordView = new LSChordView(barChords[i]).draw(
							self.ctx,
							barDimensions,
							songIt.getBarTimeSignature(),
							self.CHORDS_DISTANCE_STAVE
						);
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
			tieMng.draw(this.ctx, vxfNotes, nm, barWidthMng, song);
			this.vxfNotes = vxfNotes;
			this.vxfBars = vxfBars;
			//this.lastDrawnSong = song;

			// call drawable elem with zIndex > 10
			for (i = 0, c = this.drawableModel.length; i < c; i++) {
				if (this.drawableModel[i].zIndex >= 10 && typeof this.drawableModel[i].elem.draw === "function") {
					this.drawableModel[i].elem.draw(self);
				}
			}
			this.ctx.scale(1/this.SCALE, 1/this.SCALE);
			$.publish('LSViewer-drawEnd', this);
			this._resetScale();
		};
		return LSViewer;

	});
