define([
	'modules/core/src/SongModel',
	'modules/core/src/ChordModel',
	'modules/ChordEdition/src/ChordSpaceView',
	'modules/Cursor/src/CursorModel',
	'utils/UserLog',
	'modules/Edition/src/ElementManager',
	'jquery',
	'pubsub'
], function(SongModel, ChordModel, ChordSpaceView, CursorModel, UserLog, ElementManager, $, pubsub) {

	function ChordSpaceManager(songModel, cursor, viewer) {
		if (!songModel || !cursor) {
			throw "ChordSpaceManager missing params";
		}
		this.songModel = songModel;
		this.cursor = cursor;
		this.chordSpace = [];
		this.name = 'ChordsCursor';
		this.elemMng = new ElementManager();
		this.initSubscribe();
		this.viewer = viewer;
		this.enabled = false;
		this.MARGIN_TOP = 5;
		this.MARGIN_RIGHT = 5;
	}

	/**
	 * Subscribe to view events
	 */
	ChordSpaceManager.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('LSViewer-drawEnd', function(el, viewer) {
			self.viewer.canvasLayer.addElement(self);
			self.chordSpace = self.createChordSpace(viewer);
			self.viewer.canvasLayer.refresh();
					
		});

		$.subscribe('ChordSpaceView-updateChord', function(el, update) {
			self.updateChord(update.chordString, update.chordModel, update.chordSpace);
			$.publish('ToViewer-draw', self.songModel);
		});
		// cursor view subscribe
		$.subscribe('Cursor-moveCursorByElement-chords', function(el, inc) {
			self.moveCursorByBar(inc);
		});
	};
	/**
	 * Function return several areas to indicate which notes are selected, usefull for cursor or selection
	 * @param  {[Integer, Integer] } Array with initial position and end position
	 * @return {Array of Objects}, Object in this form: {area.x, area.y, area.xe, area.ye}
	 */
	ChordSpaceManager.prototype.createChordSpace = function(viewer) {
		var chordSpace = [];
		if (typeof viewer.vxfBars === "undefined") {
			return;
		}
		var xi, yi, xe, ye;
		var beatInBar;
		var decalX;
		var widthBeat;
		var area;
		for (var i = 0, c = viewer.vxfBars.length; i < c; i++) {
			beatInBar = viewer.vxfBars[i].timeSignature.getBeats();
			widthBeat = viewer.vxfBars[i].barDimensions.width / beatInBar;
			for (var j = 0; j < beatInBar; j++) {
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
	 *
	 * @param  {Object} coords
	 * @param  {Booelan} mouseUp
	 */
	ChordSpaceManager.prototype.updateCursor = function(coords, mouseUp) {

		this.undrawEditableChord();

		var posCursor = this.getChordsInPath(coords);

		if (posCursor[0] !== null) {
			this.cursor.setPos(posCursor);
		}
		// if event was mouseUp and we just selected one chord, we draw the pull down
		if (posCursor[0] == posCursor[1] && mouseUp) {
			this.drawEditableChord();
		}
	};

	/**
	 * @interface
	 *
	 * @param  {CanvasContext} ctx
	 */
	ChordSpaceManager.prototype.draw = function(ctx) {
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

	ChordSpaceManager.prototype.updateChord = function(chordString, chordModel, chordSpace) {
		if (typeof chordModel === "undefined" && typeof chordSpace !== "undefined") {
			chordModel = new ChordModel({
				'beat': chordSpace.beatNumber,
				'barNumber': chordSpace.barNumber,
			});
			this.songModel.getComponent('chords').addChord(chordModel);
		}
		chordModel.setChordFromString(chordString);
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
		$('#canvas_container .chordSpaceInput').devbridgeAutocomplete('dispose').remove();
	};
	/**
	 * draws the pulldown or the inpus in chords
	 */
	ChordSpaceManager.prototype.drawEditableChord = function() {
		var position = this.cursor.getPos(),
			selected;

		this.undrawEditableChord();
		for (var i = 0, c = this.chordSpace.length; i < c; i++) {
			if (i >= position[0] && i <= position[1]){
				this.chordSpace[i].drawEditableChord(this.songModel, this.MARGIN_TOP, this.MARGIN_RIGHT);	
			}
		}
	};

	return ChordSpaceManager;
});