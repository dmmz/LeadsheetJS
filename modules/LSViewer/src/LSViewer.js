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
		 *  - layer: true 	// Layer represents the interaction layer, so if true, can use mouse (but layer=true is not enough to be able to select notes) TODO: really
		 *
		 */
		function LSViewer(divContainer, params) {
			this._init(divContainer, params);
			this._initSubscribe();
			this.divContainer = divContainer;
		}
		LSViewer.prototype._init = function(divContainer, params) {
			params = params || {};
			this.DEFAULT_HEIGHT = 1000;
			this.scaler = new Scaler(); //object that scales objects. User in NoteSpaceView and ChordSpaceView
			this.SCALE = null; //scale from 0 to
			//0.999  fixes vexflow bug that doesn't draw last pixel on end bar
			this.SCALE_FIX = 0.995;

			this.CANVAS_DIV_WIDTH_PROPORTION = 0.9; //width proportion between canvas created and divContainer (space between canvas border and divContainer border)
			this.NOTE_WIDTH = 20; // estimated note width in order to be more flexible
			this.LINE_HEIGHT = 150;
			this.LINE_WIDTH = 1550;
			this.BARS_PER_LINE = 4;
			this.ENDINGS_Y = 20; //0 -> thisChordsPosY==40, the greater the closer to stave 
			this.LABELS_Y = 0; //like this.ENDINGS_Y
			this.MARGIN_TOP = 100;
			this.CHORDS_DISTANCE_STAVE = 20; //distance from stave
			this.DISPLAY_TITLE = (params.displayTitle != undefined) ? params.displayTitle : true;
			this.DISPLAY_COMPOSER = (params.displayComposer != undefined) ? params.displayComposer : true;
			this.LINE_MARGIN_TOP = 0;
			this.LAST_BAR_WIDTH_RATIO = 0.75; //in case of this.shortenLastBar = true (rendering audio), we make the last bar more compressed so that we left space for recordings longer than piece
			this.FONT_CHORDS = "18px Verdana";

			this.shortenLastBar = false;

			this.heightOverflow = params.heightOverflow || "auto";
			this.divContainer = divContainer;
			this.resizable = !params.width; //if there is a width specified, we assume that it wont be resized on window resize

			this.canvasId = "ls" + ($("canvas").length + 1);
			var width = (params.width) ? params.width : this._getWidthFromContainer(divContainer);
			this.detectEventOnAllDocument = !!params.detectEventOnAllDocument; // canvasLayer attributes
			this.canvas = this._createCanvas(this.canvasId, width, this.DEFAULT_HEIGHT);
			var renderer = new Vex.Flow.Renderer(this.canvas, Vex.Flow.Renderer.Backends.CANVAS);
			this.ctx = renderer.getContext("2d");

			this.typeResize = params.typeResize || "fluid";
			this._resize(width);
			this.layer = params.layer;

		};

		LSViewer.prototype._getWidthFromContainer = function(divContainer) {
			return $(this.divContainer).width() * this.CANVAS_DIV_WIDTH_PROPORTION;
		};
		/**
		 * Creates and return a dom element
		 */
		LSViewer.prototype._createCanvas = function(canvasId, width, height) {
			var canvas = $("<canvas id='" + canvasId + "'></canvas>");
			canvas[0].width = width;
			canvas[0].height = height;

			canvas.appendTo(this.divContainer);
			var divCss = {
				textAlign: "center",
			};
			this.barWidthMng = null;

			$(this.divContainer).css(divCss);
			return canvas[0];
		};

		LSViewer.prototype._initSubscribe = function() {
			var self = this;
			$.subscribe('ToViewer-draw', function(el, songModel) {
				if (!songModel) {
					throw "Need songModel to draw";
				}
				self.draw(songModel);
			});
			$.subscribe('ToViewer-resize', function(el, songModel) {
				if (!songModel) {
					throw "Need songModel to draw";
				}
				var width = self._getWidthFromContainer(this.divContainer);
				self.canvas.width = width;
				self._resize(width);
				self.forceNewCanvasLayer = true;
				self.draw(songModel);
			});
		};
		LSViewer.prototype._resize = function(width) {
			if (this.typeResize == 'scale') {
				var scale = width / this.LINE_WIDTH;
				this.setScale(scale * this.SCALE_FIX);
			} else { // typeResize == 'fluid'
				this.setScale(this.SCALE_FIX);
				this._setWidth(width);
			}

		};
		LSViewer.prototype._setWidth = function(width) {
			var viewerWidth = width || this.LINE_WIDTH;
			//if (viewerWidth < this.LINE_WIDTH){
			this.LINE_WIDTH = viewerWidth;
			//}
		};

		LSViewer.prototype.scale = function(ctx) {
			ctx = ctx || this.ctx;
			ctx.scale(this.SCALE, this.SCALE);
		};
		LSViewer.prototype.resetScale = function(ctx) {
			ctx = ctx || this.ctx;
			ctx.scale(1 / this.SCALE, 1 / this.SCALE);
		};
		/**
		 * function useful to be called in 'draw' function between this.scale() and this.resetScale().
		 * It takes the width without taking into account we are scaling. This way we can place elements correctly (e.g. centering the title)
		 */
		LSViewer.prototype._getNonScaledWidth = function() {
			return this.canvas.width / this.SCALE;
		};
		/**
		 * gets the BoundingBox
		 * @param  {Object} metrics ( return by ctx.getMeasureText )
		 * @param  {Integer} height  
		 * @return {Object}   with properties x,y,w,h
		 */
		LSViewer.prototype._getTextBoundingBox = function(ctx, value, x, y) {
			var metrics = ctx.measureText(value);
			var calcHalfX = (ctx.textAlign === 'center'); //textAlign is 
			var boundingBox;
			if (typeof metrics.actualBoundingBoxAscent !== "undefined") {
				// case bounding box is supported (for the moment only Chrome supports it)
				boundingBox = {
					x: calcHalfX ? x - metrics.actualBoundingBoxRight / 2 : x - metrics.actualBoundingBoxRight,
					y: y - metrics.actualBoundingBoxAscent,
					w: metrics.actualBoundingBoxRight,
					h: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
				};
			} else {
				//if not supported, it's a worse solution, as height is arbitrary, passed as parameter
				var height = Number(ctx.font.substr(0, ctx.font.indexOf("px")));
				boundingBox = {
					x: calcHalfX ? x - metrics.width / 2 : x - metrics.width,
					y: y - height,
					w: metrics.width,
					h: height
				};
			}
			return boundingBox;
		};

		LSViewer.prototype._displayTitle = function(title) {
			var oldTextAlign = this.ctx.textAlign;
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'bottom';
			this.ctx.font = "32px lato Verdana";
			var x = this._getNonScaledWidth() / 2,
				y = 60,
				maxWidth = this.canvas.width;
			this.ctx.fillText(title, x, y, maxWidth);
			this.titleView = this._getTextBoundingBox(this.ctx, title, x, y);
			this.ctx.textAlign = oldTextAlign;
		};

		LSViewer.prototype._displayComposer = function(composer) {
			var oldTextAlign = this.ctx.textAlign;
			this.ctx.textAlign = 'right';
			this.ctx.font = "24px lato Verdana";
			if (typeof composer === "undefined") {
				composer = 'Unknown';
			}
			var x = this._getNonScaledWidth() - 20,
				y = 20,
				maxWidth = this._getNonScaledWidth();
			this.ctx.fillText(composer, x, y, maxWidth);
			this.composerView = this._getTextBoundingBox(this.ctx, composer, x, y);
			this.ctx.textAlign = oldTextAlign;

		};
		LSViewer.prototype.setScale = function(scale) {
			this.SCALE = scale;
			this.scaler.setScale(scale);
		};
		LSViewer.prototype.setLineMarginTop = function(lineMarginTop, bottom) {
			if (!bottom) {
				this.MARGIN_TOP += lineMarginTop;
			} else {
				this.LINE_MARGIN_TOP = lineMarginTop;
			}
			this.LINE_HEIGHT += lineMarginTop;
		};

		LSViewer.prototype.getLineHeight = function() {
			return this.LINE_HEIGHT;
		};
		LSViewer.prototype.setLineHeight = function(lineHeight) {
			if (!isNaN(lineHeight)) {
				this.LINE_HEIGHT = lineHeight;
			}
		};

		LSViewer.prototype.setHeight = function(song, barWidthMng) {
			var totalNumBars = song.getComponent("bars").getTotal();
			this.canvas.height = (barWidthMng.getDimensions(totalNumBars - 1).top + this.LINE_HEIGHT) * this.SCALE;
			/*if (this.canvas.height > $(this.divContainer).height() && this.heightOverflow == 'scroll') {
				$(this.divContainer).css({
					overflowY: "scroll"
				});
			} else {
				$(this.divContainer).height(this.canvas.height);
			}*/

			if (this.canvas.height != $(this.divContainer).height()) {
				if (this.heightOverflow == 'scroll') {
					$(this.divContainer).css({
						overflowY: "scroll"
					});
				} else {
					$(this.divContainer).height(this.canvas.height);
				}
				this.forceNewCanvasLayer = true;
				//this.canvasLayer = new CanvasLayer(this); //the canvasLayer needs to be created after the score has been drawn
			}
		};
		LSViewer.prototype.setShortenLastBar = function(bool) {
			this.shortenLastBar = bool;
		};

		LSViewer.prototype.draw = function(song, params) {
			params = params || {};
			if (typeof song === "undefined") {
				console.warn('song is empty'); // only for debug, remove after 1 week safe
				return;
			}
			//console.log("draw");
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
				noteViews = [],
				vxfBars = [],
				barDimensions,
				tieMng = new TieManager();

			var lastBarWidthRatio = this.shortenLastBar ? this.LAST_BAR_WIDTH_RATIO : 1;
			this.barWidthMng = new BarWidthManager(this.LINE_HEIGHT, this.LINE_WIDTH, this.NOTE_WIDTH, this.BARS_PER_LINE, this.MARGIN_TOP, lastBarWidthRatio);
			this.barWidthMng.calculateBarsStructure(song, nm, cm, this.ctx, this.FONT_CHORDS);
			this.setHeight(song, this.barWidthMng);
			this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
			this.scale();


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

						bar.push(noteView.getVexflowNote());
						noteViews.push(noteView);
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
							self.CHORDS_DISTANCE_STAVE,
							self.FONT_CHORDS
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
					tupletMng.draw(self.ctx, noteViews);
					//console.timeEnd('draw');

					songIt.next();
					sectionIt.next();
					//console.timeEnd('whole bar');
				}
				numSection++;
			});
			tieMng.draw(this.ctx, noteViews, nm, this.barWidthMng, song);
			this.noteViews = noteViews;
			this.vxfBars = vxfBars;
			this.ctx.fillStyle = "black";
			this.ctx.strokeStyle = "black";
			if (this.DISPLAY_COMPOSER) {
				this._displayComposer(song.getComposer());
			}
			if (this.DISPLAY_TITLE) {
				this._displayTitle(song.getTitle());
			}
			this.resetScale();
			//console.timeEnd('whole draw');
			// if we requested to have a layer and we haven't already created it
			// TODO: this.layer anhd this.forceNewLayer are more or less the same
			if (this.layer && (!this.canvasLayer) || (this.layer && this.forceNewCanvasLayer)) {
				this.forceNewCanvasLayer = false;
				if (this.canvasLayer){
					this.canvasLayer.destroy();//to remove html listeners
				}
				this.canvasLayer = new CanvasLayer(this, this.detectEventOnAllDocument); //the canvasLayer needs to be created after the score has been drawn
			}
			$.publish('LSViewer-drawEnd', this);
		};
		/**
		 * When drawing an element from another module, it has to use this function
		 * @param  {Function} drawFunc function that draws the element
		 */
		LSViewer.prototype.drawElem = function(drawFunc) {
			this.scale(this.ctx);
			drawFunc();
			this.resetScale(this.ctx);
		};
		return LSViewer;

	});