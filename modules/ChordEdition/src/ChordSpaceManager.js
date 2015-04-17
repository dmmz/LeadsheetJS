define([
	'modules/core/src/SongModel',
	'modules/core/src/ChordModel',
	'modules/ChordEdition/src/ChordSpaceView',
	'modules/Cursor/src/CursorModel',
	'utils/UserLog',
	'pubsub',
], function(SongModel, ChordModel, ChordSpaceView, CursorModel, UserLog, pubsub) {

	function ChordSpaceManager(songModel, cursor) {
		this.songModel = songModel || new SongModel();
		this.cursor = cursor || new CursorModel();
		this.chordSpace = [];
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	ChordSpaceManager.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('ChordSpaceView-updateChord', function(el, update) {
			self.updateChord(update.chordString, update.chordModel, update.chordSpace);
			$.publish('ToViewer-draw', self.songModel);
		});
		$.subscribe('LSViewer-click', function(el, position) {
			var inPath = self.isInPath(position.x, position.y);
			if (inPath !== false) {
				$.publish('ToAllCursor-setEditable', false);
				self.cursor.setEditable(true);
				self.cursor.setPos(inPath);
				$.publish('ToViewer-draw', self.songModel);
			} else {
				self.undraw();
			}
		});
		$.subscribe('LSViewer-mousemove', function(el, position) {
			/*var inPath = self.isInPath(position.x, position.y);
			if (inPath !== false) {
				myApp.viewer.el.style.cursor = 'pointer';
				//self.cursor.setPos(inPath);
				//$.publish('ToViewer-draw', self.songModel);
			} else {
				myApp.viewer.el.style.cursor = 'default';
			}*/
		});
		$.subscribe('LSViewer-drawEnd', function(el, viewer) {
			if (self.cursor.getEditable()) {
				self.refresh(viewer);
			} else if (self.chordSpace.length === 0) {
				// case chordspace have never been drawn, we create it so isInPath function can works
				self.chordSpace = self.createChordSpace(viewer);
			} else {
				self.undraw(); // maybe we should call it only once
			}
		});
		// cursor view subscribe
		$.subscribe('CursorView-moveCursorByElementchords', function(el, inc) {
			self.moveCursorByBar(inc);
		});
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

	ChordSpaceManager.prototype.refresh = function(viewer) {
		this.chordSpace = this.createChordSpace(viewer);
		this.draw(viewer);
	};

	ChordSpaceManager.prototype.isInPath = function(x, y) {
		for (var i = 0, c = this.chordSpace.length; i < c; i++) {
			if (typeof this.chordSpace[i] !== "undefined") {
				if (this.chordSpace[i].isInPath(x, y)) {
					return i;
				}
			}
		}
		return false;
	};

	ChordSpaceManager.prototype.moveCursorByBar = function(inc) {
		if (this.cursor.getEditable() === false) {
			return;
		}
		var barNum = this.chordSpace[this.cursor.getPos()[0]].barNumber;
		var startBeat = this.songModel.getStartBeatFromBarNumber(barNum+inc) - 1;

		if (barNum === 0 && inc === -1) {
			this.cursor.setPos(0);
			$.publish('ToViewer-draw', this.songModel);
			return;
		}

		this.cursor.setPos(startBeat);
		$.publish('ToViewer-draw', this.songModel);
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
		var scale = viewer.SCALE;
		for (var i = 0, c = viewer.vxfBars.length; i < c; i++) {
			beatInBar = viewer.vxfBars[i].timeSignature.getBeats();
			widthBeat = viewer.vxfBars[i].barDimensions.width / beatInBar;
			for (var j = 0; j < beatInBar; j++) {
				area = {
					x: (viewer.vxfBars[i].barDimensions.left + widthBeat * j) * scale,
					y: (viewer.vxfBars[i].barDimensions.top - 17) * scale,
					xe: widthBeat * scale,
					ye: 20
				};
				chordSpace.push(new ChordSpaceView(viewer, area, i, j + 1));
			}
		}
		return chordSpace;
	};

	ChordSpaceManager.prototype.undraw = function(viewer) {
		$('#canvas_container .chordSpaceInput').devbridgeAutocomplete('dispose').remove();
	};

	ChordSpaceManager.prototype.draw = function(viewer) {
		var position = this.cursor.getPos();
		var saveStrokeColor = viewer.ctx.strokeStyle;
		viewer.ctx.lineWidth = 0.7;
		var selected = false;
		this.undraw();
		for (var i = 0, c = this.chordSpace.length; i < c; i++) {
			if (position[0] <= i && i <= position[1]) {
				selected = true;
			} else {
				selected = false;
			}
			this.chordSpace[i].draw(viewer, this.songModel, selected);
		}
		viewer.ctx.strokeStyle = saveStrokeColor;
	};

	return ChordSpaceManager;
});