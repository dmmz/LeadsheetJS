define([
	'modules/core/src/SongModel',
	'modules/core/src/ChordModel',
	'modules/ChordEdition/src/ChordSpaceView',
	'modules/Cursor/src/CursorModel',
	'utils/UserLog',
	'pubsub',
], function(SongModel, ChordModel, ChordSpaceView, CursorModel, UserLog, pubsub) {

	function ChordSpaceManager(songModel, cursor, viewer) {
		this.songModel = songModel || new SongModel();
		this.cursor = cursor || new CursorModel();
		this.chordSpace = [];
		this.elemName = 'chordCursor';
		this.initSubscribe();
		this.viewer = viewer;
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
		$.subscribe(this.elemName+"-selection", function(el,cursor){
			if (cursor[0] !== false && cursor[1] !== false && cursor[0] == cursor[1]){
				self.drawEditableChord();
				//$.publish('ToViewer-draw', self.songModel);
			}			
		});
		/*$.subscribe('CanvasLayer-selection', function(el, position) {
			var inPath = self.isInPath(position.x, position.y);
			if (inPath !== false) {
				$.publish('ToAllCursors-setEditable', false);
				self.cursor.setEditable(true);
				self.cursor.setPos(inPath);
				$.publish('ToViewer-draw', self.songModel);
			} else {
				self.undrawEditableChord();
			}
		});*/
		$.subscribe('CanvasLayer-mousemove', function(el, position) {
			if (!self.cursor.getEditable()) return;	
			var inPath = self.isInPath({x:position.x, y:position.y});
			if (inPath !== false) {
				self.viewer.el.style.cursor = 'pointer';
				//self.cursor.setPos(inPath);
				//$.publish('ToViewer-draw', self.songModel);
			} else {
				self.viewer.el.style.cursor = 'default';
			}
		});
		$.subscribe('LSViewer-drawEnd', function(el, viewer) {
			self.viewer.canvasLayer.addElement(self.elemName, self);
			if (self.cursor.getEditable()) {
				//self.refresh(viewer);
			} else if (self.chordSpace.length === 0) {
				// case chordspace have never been drawn, we create it so isInPath function can work
				self.chordSpace = self.createChordSpace(viewer);
			} else {
				self.undrawEditableChord(); // maybe we should call it only once
			}
		});
		// cursor view subscribe
		$.subscribe('CursorView-moveCursorByElementchords', function(el, inc) {
			self.moveCursorByBar(inc);
		});
	};
	//CANVASLAYER ELEMENT METHOD
	ChordSpaceManager.prototype.updateCursor = function(coords) {
		this.undrawEditableChord(this.view);
		var inPath = this.getChordsInPath(coords);
		
		if (inPath[0] !== null) {
			//$.publish('ToAllCursors-setEditable', false);
			this.cursor.setEditable(true);
			this.cursor.setPos(inPath);
			//$.publish('ToViewer-draw', self.songModel);
		} 
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

	// ChordSpaceManager.prototype.refresh = function(viewer) {
	// 	this.chordSpace = this.createChordSpace(viewer);
	// 	this.draw(viewer);
	// };

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
	ChordSpaceManager.prototype.getChordsInPath = function(coords) {
		var note,
			min = null,
			max = null;
		for (var i in this.chordSpace) {
			if (this.chordSpace[i].isInPath(coords)) {
				if (min == null) {
					min = Number(i);
				}
				if (max == null || max < i) {
					max = Number(i);
				}
			}
		}
		return (min === null && max === null) ? false : [min, max];
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
		for (var i = 0, c = viewer.vxfBars.length; i < c; i++) {
			beatInBar = viewer.vxfBars[i].timeSignature.getBeats();
			widthBeat = viewer.vxfBars[i].barDimensions.width / beatInBar;
			for (var j = 0; j < beatInBar; j++) {
				area = {
					x: (viewer.vxfBars[i].barDimensions.left + widthBeat * j) ,
					y: (viewer.vxfBars[i].barDimensions.top - 17) ,
					w: widthBeat ,
					h: 20
				};
				chordSpace.push(new ChordSpaceView(viewer, area, i, j + 1));
			}
		}
		return chordSpace;
	};

	ChordSpaceManager.prototype.undrawEditableChord = function(viewer) {
		$('#canvas_container .chordSpaceInput').devbridgeAutocomplete('dispose').remove();
	};
	/* draws input box ...etc. for the moment is not called, because we are fucking refactoring*/
	ChordSpaceManager.prototype.drawEditableChord = function() {
		var position = this.cursor.getPos();
		var self = this;
		this.viewer.drawElem(function(ctx){
				var saveStrokeColor = ctx.strokeStyle;
				ctx.lineWidth = 0.7;
				var selected = false;
				self.undrawEditableChord();
				for (var i = 0, c = self.chordSpace.length; i < c; i++) {
					if (position[0] <= i && i <= position[1]) {
						selected = true;
					} else {
						selected = false;
					}
					self.chordSpace[i].drawEditableChord(self.songModel, selected);
				}
				ctx.strokeStyle = saveStrokeColor;
		});

	};
	ChordSpaceManager.prototype.draw = function(ctx) {
		var pos = this.cursor.getPos();
		if (pos[0]!== false){
			for (var i = pos[0]; i <= pos[1]; i++) {
				this.chordSpace[i].draw(ctx);
			}		
		}
	};

	return ChordSpaceManager;
});