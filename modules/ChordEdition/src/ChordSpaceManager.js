define([
	'modules/core/src/SongModel',
	'modules/core/src/ChordModel',
	'modules/ChordEdition/src/ChordSpaceView',
	'modules/Cursor/src/CursorModel',
	'modules/converters/MusicCSLJson/src/ChordModel_CSLJson',
	'utils/UserLog',
	'modules/Edition/src/ElementManager',
	'jquery',
	'pubsub'
], function(SongModel, ChordModel, ChordSpaceView, CursorModel, ChordModel_CSLJson, UserLog, ElementManager, $, pubsub) {
	/**
	 * ChordSpaceManager creates and manages an array of chord space which is represented as a rectangle on each beat on top of bars
	 * @exports ChordEdition/ChordSpaceManager
	 */
	function ChordSpaceManager(songModel, cursor, viewer) {
		if (!songModel || !cursor) {
			throw "ChordSpaceManager missing params";
		}
		this.CL_NAME = 'ChordsCursor';
		this.CL_TYPE = 'CURSOR';
		this.songModel = songModel;
		this.cursor = cursor;
		this.chordSpace = [];
		this.elemMng = new ElementManager();
		this.initSubscribe();
		this.enabled = false;
		this.MARGIN_TOP = 5;
		this.MARGIN_RIGHT = 5;
		this.viewer = viewer;
	}

	/**
	 * Subscribe to view events
	 */
	ChordSpaceManager.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('LSViewer-drawEnd', function(el, viewer) {
			if (typeof viewer.canvasLayer === "undefined") {
				return;
			}
			viewer.canvasLayer.addElement(self);
			self.chordSpace = self.createChordSpace(viewer);
			self.cursor.setListElements(self.chordSpace.length);
			viewer.canvasLayer.refresh();
		});

		$.subscribe('ChordSpaceView-updateChord', function(el, chordJson, chordModel, chordSpace) {
			self.updateChord(chordJson, chordModel, chordSpace);
			$.publish('ToViewer-draw', self.songModel);
		});
		// cursor view subscribe
		$.subscribe('Cursor-moveCursorByElement-chords', function(el, inc) {
			self.moveCursorByBar(inc);
		});
		$.subscribe('ctrl-a', function() {
			self.enable();
			self.cursor.selectAll();
			self.viewer.canvasLayer.refresh();
		})
	};
	ChordSpaceManager.prototype.getType = function() {
		return this.CL_TYPE;
	};
	/**
	 * Function return several areas to indicate which notes are selected, usefull for cursor or selection
	 * @param  {Array} Array with initial position and end position as integer
	 * @return {Array}, return array of object in this form: {area.x, area.y, area.xe, area.ye}
	 */
	ChordSpaceManager.prototype.createChordSpace = function(viewer) {
		var chordSpace = [];
		if (typeof viewer.vxfBars === "undefined") {
			return;
		}
		var xi, yi, xe, ye;
		var beatsInBar;
		var decalX;
		var widthBeat;
		var area;
		for (var i = 0, c = viewer.vxfBars.length; i < c; i++) {
			beatsInBar = viewer.vxfBars[i].timeSignature.getBeats();
			widthBeat = viewer.vxfBars[i].barDimensions.width / beatsInBar;
			for (var j = 0; j < beatsInBar; j++) {
				area = {
					x: (viewer.vxfBars[i].barDimensions.left + widthBeat * j),
					y: (viewer.vxfBars[i].barDimensions.top - 17),
					w: widthBeat,
					h: 20
				};
				chordSpace.push(new ChordSpaceView(viewer, area, i, j + 1, viewer.scaler));
			}
		}
		return chordSpace;
	};
	/**
	 * @interface
	 *
	 * @param  {Object} coords [description]
	 */
	ChordSpaceManager.prototype.getYs = function(coords) {
		return this.elemMng.getYs(this.chordSpace, coords);
	};

	/**
	 * @interface
	 * @param  {Object} coords  
	 * @param  {Integer} ini     
	 * @param  {Integer} end     
	 * @param  {Boolean} clicked 
	 * @param  {Boolean} mouseUp, (never used but needed to keep parameter order)
	 * @param  {Boolean} ctrlPressed 
	 */
	ChordSpaceManager.prototype.onSelected = function(coords, ini, end, clicked, mouseUp, ctrlPressed) {
		this.undrawEditableChord();

		var posCursor = this.elemMng.getElemsInPath(this.chordSpace, coords, ini, end, this.getYs(coords));

		if (ctrlPressed){
			posCursor = this.elemMng.getMergedCursors(posCursor, this.cursor.getPos());
		}

		if (posCursor[0] !== null) {
			this.cursor.setPos(posCursor);
		}
		// if event was clicked and we just selected one chord, we draw the pull down
		if (posCursor[0] == posCursor[1] && clicked) {
			this.drawEditableChord();
		}
	};

	/**
	 * @interface
	 *
	 * @param  {CanvasContext} ctx
	 */
	ChordSpaceManager.prototype.drawCursor = function(ctx) {
		var self = this;

		function drawChordSpaceBorders(ctx) {
			for (var j = 0; j < self.chordSpace.length; j++) {
				var position = self.chordSpace[j].getArea();

				ctx.strokeStyle = "#999999";
				ctx.strokeRect(
					position.x,
					position.y - self.MARGIN_TOP,
					position.w - self.MARGIN_RIGHT,
					position.h + self.MARGIN_TOP
				);
			}
		}
		var pos = this.cursor.getPos();
		if (pos[0] !== false) {
			for (var i = pos[0]; i <= pos[1]; i++) {
				this.chordSpace[i].draw(ctx, self.MARGIN_TOP, self.MARGIN_RIGHT);
			}
		}
		drawChordSpaceBorders(ctx);
	};
	/**
	 * @interface
	 *
	 * @return {Boolean}
	 */
	ChordSpaceManager.prototype.isEnabled = function() {
		return this.enabled;
	};

	/**
	 * @interface
	 */
	ChordSpaceManager.prototype.enable = function() {
		this.enabled = true;
	};

	/**
	 * @interface
	 */
	ChordSpaceManager.prototype.disable = function() {
		this.undrawEditableChord();
		this.enabled = false;
	};

	/**
	 * @interface
	 * @param  {Object} coords {x: xval, y: yval}}
	 * @return {Boolean}
	 */
	ChordSpaceManager.prototype.inPath = function(coords) {
		return !!this.getChordsInPath(coords);
	};
	/**
	 * @interface
	 */
	ChordSpaceManager.prototype.setCursorEditable = function(bool) {
		this.cursor.setEditable(bool);
	};

	ChordSpaceManager.prototype.updateChord = function(chordJson, chordModel, chordSpace) {
		var chordMng = this.songModel.getComponent('chords');
		chordJson.beat = chordSpace.beatNumber;
		chordJson.barNumber = chordSpace.barNumber;

		if (chordModel === undefined) { //adding new chord
			var chordModel = ChordModel_CSLJson.importFromMusicCSLJSON(chordJson);
			chordMng.addChord(chordModel);
		} else if (chordJson.empty) {
			chordMng.removeChord(chordModel);
		} else {
			var i = chordMng.getChordIndex(chordModel);
			chordModel = ChordModel_CSLJson.importFromMusicCSLJSON(chordJson);
			chordMng.setChord(chordModel, i);
		}
		$.publish('ToHistory-add', 'Update Chords ' + chordModel.toString());

	};

	ChordSpaceManager.prototype.getChordsInPath = function(coords) {
		return this.elemMng.getElemsInPath(this.chordSpace, coords);
	};

	ChordSpaceManager.prototype.moveCursorByBar = function(inc) {
		var barNum = this.chordSpace[this.cursor.getPos()[0]].barNumber;
		var startBeat = this.songModel.getStartBeatFromBarNumber(barNum + inc) - 1;

		if (barNum === 0 && inc === -1) {
			this.cursor.setPos(0);
		} else {
			this.cursor.setPos(startBeat);
			this.drawEditableChord();
		}
	};



	ChordSpaceManager.prototype.undrawEditableChord = function() {
		if (this.htmlInput) {
			this.htmlInput.input.devbridgeAutocomplete('dispose');
			this.htmlInput.remove();
		}
	};
	/**
	 * draws the pulldown or the inputs in chords
	 */
	ChordSpaceManager.prototype.drawEditableChord = function() {
		var position = this.cursor.getPos();

		this.undrawEditableChord();
		// position[0] === position[1] always
		position = position[0];

		this.htmlInput = this.chordSpace[position].drawEditableChord(this.songModel, this.MARGIN_TOP, this.MARGIN_RIGHT);
	};

	return ChordSpaceManager;
});