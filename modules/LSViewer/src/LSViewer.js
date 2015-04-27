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
		'modules/LSViewer/src/CanvasLayer',
		'modules/LSViewer/src/Scaler',
		'jquery',
		'pubsub'
	],
	function(Vex, LSNoteView, LSChordView, LSBarView, BeamManager, TieManager, TupletManager, BarWidthManager, SectionBarsIterator, SongBarsIterator, CanvasLayer, Scaler, $, pubsub) {
		/**
		 * LSViewer Constructor
		 * @param {domObject} jQuery divContainer ; e.g.: $("#divContainerId");
		 * @param {Object} params, possible params:
		 *
		 *  - width: in pixels
		 *
		 *  - heightOverflow: "scroll" | "auto".
		 *    If scroll, when canvas is larger than containing div, it will scroll, if not, it will change div width
		 *  - typeResize: "scale" | "fluid",
		 *    If scale, when canvas is wider than containing div, it will scale to fit; if "fluid" it will try to fit withouth scaling.
		 *  - displayTitle
		 *  - displayComposer   // TODO: possibility of combining both (scale partially and then fluid)
		 *  - layer: true
		 *
		 */
		function LSViewer(divContainer, params) {
			this._init(divContainer, params);
			this._initSubscribe();
			this.el = divContainer; 
		}
		LSViewer.prototype._init = function(divContainer, params) {
			params = params || {};
			this.DEFAULT_HEIGHT = 1000;
			this.scaler = new Scaler();	//object that scales objects. User in NoteSpaceView and ChordSpaceView
			this.SCALE = null;		//scale from 0 to
			//0.999  fixes vexflow bug that doesn't draw last pixel on end bar
			this.setScale(0.999);

			this.CANVAS_DIV_WIDTH_PROPORTION = 0.8; //width proportion between canvas created and divContainer
			this.NOTE_WIDTH = 20; // estimated note width in order to be more flexible
			this.LINE_HEIGHT = 150;
			this.LINE_WIDTH = 1160;
			this.BARS_PER_LINE = 4;
			this.ENDINGS_Y = 20; //0 -> thisChordsPosY==40, the greater the closer to stave 
			this.LABELS_Y = 0; //like this.ENDINGS_Y
			this.MARGIN_TOP = 100;
			this.CHORDS_DISTANCE_STAVE = 20; //distance from stave
			this.DISPLAY_TITLE = (params.displayTitle != undefined) ? params.displayTitle : true;
			this.DISPLAY_COMPOSER = (params.displayComposer != undefined) ? params.displayComposer : true;
			this.LINE_MARGIN_TOP = 0;

			this.heightOverflow = params.heightOverflow || "auto";
			this.divContainer = divContainer;

			var idScore = "ls" + ($("canvas").length + 1),
				width = (params.width) ? params.width : $(divContainer).width() * this.CANVAS_DIV_WIDTH_PROPORTION;

			this.canvas = this._createCanvas(idScore, width, this.DEFAULT_HEIGHT);
			var renderer = new Vex.Flow.Renderer(this.canvas, Vex.Flow.Renderer.Backends.CANVAS);
			this.ctx = renderer.getContext("2d");

			if (params.typeResize == 'scale') {
				this.setScale((width / this.LINE_WIDTH) * 0.95);
			} else { // typeResize == 'fluid'
				this._setWidth(width);
			}
			this.layer = params.layer;

		};
		/**
		 * Creates and return a dom element
		 */
		LSViewer.prototype._createCanvas = function(idScore, width, height) {
			var canvas = $("<canvas id='" + idScore + "'></canvas>");
			canvas[0].width = width;
			canvas[0].height = height;
			canvas.appendTo(this.divContainer);
			var divCss = {
				textAlign: "center"
			};
			this.barWidthMng = null;

			$(this.divContainer).css(divCss);
			return canvas[0];
		};
		
		LSViewer.prototype._initSubscribe = function() {
			var self = this;
			$.subscribe('ToViewer-draw', function(el, songModel) {
				self.draw(songModel);
			});
		};

		LSViewer.prototype._setWidth = function(width) {
			var viewerWidth = width || this.LINE_WIDTH;
			this.LINE_WIDTH = viewerWidth;
		};

		LSViewer.prototype._scale = function(ctx) {
			ctx = ctx || this.ctx;
			ctx.scale(this.SCALE, this.SCALE);
		};
		LSViewer.prototype._resetScale = function(ctx) {
			ctx = ctx || this.ctx;
			ctx.scale(1 / this.SCALE, 1 / this.SCALE);
		};
		/**
		 * function useful to be called in 'draw' function between this._scale() and this._resetScale().
		 * It takes the width without taking into account we are scaling. This way we can place elements correctly (e.g. centering the title)
		 */
		LSViewer.prototype._getNonScaledWidth = function() {
			return this.canvas.width / this.SCALE;
		};

		LSViewer.prototype._displayTitle = function(title) {
			var oldTextAlign = this.ctx.textAlign;
			this.ctx.textAlign = 'center';
			this.ctx.font = "32px lato Verdana";
			this.ctx.fillText(title, this._getNonScaledWidth() / 2, 60, this._getNonScaledWidth());
			this.ctx.textAlign = oldTextAlign;
		};

		LSViewer.prototype._displayComposer = function(composer) {
			var oldTextAlign = this.ctx.textAlign;
			this.ctx.textAlign = 'right';
			this.ctx.font = "24px lato Verdana";
			if (typeof composer === "undefined") {
				composer = 'Unknown';
			}
			this.ctx.fillText(composer, this._getNonScaledWidth() - 20, 20, this._getNonScaledWidth());
			this.ctx.textAlign = oldTextAlign;

		};
		LSViewer.prototype.setScale = function(scale) {
			this.SCALE = scale;
			this.scaler.setScale(scale);

		};
		LSViewer.prototype.setLineMarginTop = function(lineMarginTop, bottom) {
			if (!bottom) {
				this.MARGIN_TOP += lineMarginTop;
			}
			this.LINE_HEIGHT += lineMarginTop;
			this.LINE_MARGIN_TOP = lineMarginTop;
		};
		LSViewer.prototype.setHeight = function(song, barWidthMng) {
			var totalNumBars = song.getComponent("bars").getTotal();
			this.canvas.height = (barWidthMng.getDimensions(totalNumBars - 1).top + this.LINE_HEIGHT) * this.SCALE;
			if (this.canvas.height > $(this.divContainer).height() && this.heightOverflow == 'scroll') {
				$(this.divContainer).css({
					overflowY: "scroll"
				});
			} else {
				$(this.divContainer).height(this.canvas.height);
			}
		};
		

		LSViewer.prototype.draw = function(song) {
			if (typeof song === "undefined") {
				console.warn('song is empty'); // only for debug, remove after 1 week safe
				return;
			}
			//console.time('whole draw');
			var i, j, v, c;

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

			this.barWidthMng = new BarWidthManager(this.LINE_HEIGHT, this.LINE_WIDTH, this.NOTE_WIDTH, this.BARS_PER_LINE, this.MARGIN_TOP);
			this.barWidthMng.calculateBarsStructure(song, nm);
			this.setHeight(song, this.barWidthMng);

			this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
			this._scale();


			var numSection = 0;
			var songIt = new SongBarsIterator(song);
			var barView;
			var sectionIt;

			song.getSections().forEach(function(section) {

				// for each bar
				sectionIt = new SectionBarsIterator(section);
				while (sectionIt.hasNext()) {
					//console.time('whole bar');
					//console.log(sectionIt.getBarIndex());

					beamMng = new BeamManager();
					tupletMng = new TupletManager();
					bar = [];
					//console.time('getNotes');
					barNotes = nm.getNotesAtBarNumber(songIt.getBarIndex(), song);
					//console.timeEnd('getNotes');

					//console.time('drawNotes');
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
					//console.timeEnd('drawNotes');

					barDimensions = self.barWidthMng.getDimensions(songIt.getBarIndex());
					barView = new LSBarView(barDimensions);
					//console.time('drawBars');
					barView.draw(self.ctx, songIt, sectionIt, self.ENDINGS_Y, self.LABELS_Y);
					//console.timeEnd('drawBars');

					vxfBars.push({
						'barDimensions': barDimensions,
						'timeSignature': songIt.getBarTimeSignature(),
					});

					//console.time('getChords');
					barChords = cm.getChordsByBarNumber(songIt.getBarIndex());
					for (i = 0, c = barChords.length; i < c; i++) {
						chordView = new LSChordView(barChords[i]).draw(
							self.ctx,
							barDimensions,
							songIt.getBarTimeSignature(),
							self.CHORDS_DISTANCE_STAVE
						);
					}
					//console.timeEnd('getChords');
					//console.time('beams');
					vxfBeams = beamMng.getVexflowBeams(); // we need to do getVexflowBeams before drawing notes
					//console.timeEnd('beams');
					//console.time('stave');
					Vex.Flow.Formatter.FormatAndDraw(self.ctx, barView.getVexflowStave(), bar, {
						autobeam: false
					});
					//console.timeEnd('stave');
					//console.time('draw');
					beamMng.draw(self.ctx, vxfBeams); // and draw beams needs to be done after drawing notes
					tupletMng.draw(self.ctx, vxfNotes);
					//console.timeEnd('draw');

					songIt.next();
					sectionIt.next();
					//console.timeEnd('whole bar');
				}
				numSection++;
			});
			tieMng.draw(this.ctx, vxfNotes, nm, this.barWidthMng, song);
			this.vxfNotes = vxfNotes;
			this.vxfBars = vxfBars;
			this.ctx.fillStyle = "black";
			this.ctx.strokeStyle = "black";
			this._displayComposer(song.getComposer());
			this._displayTitle(song.getTitle());
			this._resetScale();
			//console.timeEnd('whole draw');

			if (this.layer && !this.canvasLayer) {
				this.canvasLayer = new CanvasLayer(this).getCanvas();
				this.layerCtx = this.canvasLayer.getContext('2d');
			}
			$.publish('LSViewer-drawEnd', this);
		};
		/**
		 * When drawing an element from another module, it has to use this function
		 * @param  {Function} drawFunc function that draws the element, uses context determined by the other param layer
		 * @param  {Boolean} layer    if true, it uses the upper layer (this.layerCtx), if not, uses the basic layer (this.ctx)
		 */
		LSViewer.prototype.drawElem = function(drawFunc, layer) {
			var ctx = layer ? this.layerCtx : this.ctx;
			this._scale(ctx);
			drawFunc(ctx);
			this._resetScale(ctx);
		};
		return LSViewer;

	});