define([
	'modules/Cursor/src/CursorModel',
	'utils/UserLog',
	'modules/Edition/src/ElementManager',
	'jquery',
	'pubsub',
], function(CursorModel, UserLog, ElementManager, $, pubsub) {
	/**
	 * NoteSpaceManager creates and manages an array of notes represented by their positions
	 * @exports NoteEdition/NoteSpaceManager
	 */
	function NoteSpaceManager(cursor, viewer) {

		if (!cursor) {
			throw "NoteSpaceManager - missing cursor";
		}
		if (!viewer) {
			throw "NoteSpaceManager - missing viewer";
		}
		this.CL_TYPE = 'CURSOR';
		this.CL_NAME = 'NotesCursor';
		this.cursor = cursor;
		this.viewer = viewer;
		this.elemMng = new ElementManager();
		this.noteSpace = [];
		this.initSubscribe();
		this.enabled = true;

		this.HEIGHT = 80;
		this.MARGIN_TOP = 20;
		this.MARGIN_LEFT = 6;
		this.MARGIN_RIGHT = 9;
	}

	/**
	 * Subscribe to view events
	 */
	NoteSpaceManager.prototype.initSubscribe = function() {
		var self = this;

		$.subscribe('LSViewer-drawEnd', function(el, viewer) {
			if (!self.viewer.canvasLayer) {
				throw "NoteSpaceManager needs CanvasLayer";
			}

			//if (self.cursor.getEditable()) {
			self.noteSpace = self.createNoteSpace(self.viewer);
			self.cursor.setListElements(self.noteSpace.length);
			self.viewer.canvasLayer.addElement(self);
			self.viewer.canvasLayer.refresh();

		});

		$.subscribe('ToNoteSpaceManager-enable', function() {
			self.enable();
		})
		$.subscribe('ctrl-a', function() {
			self.enable();
			self.cursor.selectAll();
			self.viewer.canvasLayer.refresh();
		});

	};

	NoteSpaceManager.prototype.createNoteSpace = function(viewer) {
		var noteSpace = [];
		if (typeof viewer.vxfBars === "undefined") {
			return;
		}
		noteSpace = viewer.noteViews;
		for (var i = 0; i < noteSpace.length; i++) {
	
			noteSpace[i].position.x -= this.MARGIN_LEFT;
			noteSpace[i].position.y += this.MARGIN_TOP;
			noteSpace[i].position.w += this.MARGIN_LEFT + this.MARGIN_RIGHT;
			noteSpace[i].position.h = this.HEIGHT;

		}
		return noteSpace;
	};

	NoteSpaceManager.prototype.getType = function() {
		return this.CL_TYPE;
	};

	/**
	 * @interface
	 * @param  {Object} coords
	 * @return {Object} e.g: {topY:44, bottomY: 23}
	 */
	NoteSpaceManager.prototype.getYs = function(coords) {
		return this.elemMng.getYs(this.noteSpace, coords);
	};

	/**
	 * @interface
	 * @param  {Object} coords      
	 * @param  {Integer} ini         
	 * @param  {Integer} end         
	 * @param  {Boolean} clicked     
	 * @param  {Boolean} mouseUp     
	 * @param  {Boolean} ctrlPressed 
	 */
	NoteSpaceManager.prototype.onSelected = function(coords, ini, end, clicked, mouseUp, ctrlPressed) {
		var posCursor;
		var coordsTop, coordsBottom;

		posCursor = this.elemMng.getElemsInPath(this.noteSpace, coords, ini, end, this.getYs(coords));
		if (ctrlPressed){
			posCursor = this.elemMng.getMergedCursors(posCursor, this.cursor.getPos());
		}

		if (posCursor) {
			this.cursor.setPos(posCursor);
			//when clicking on a note, if there is an audio player, cursor should be updated
			$.publish('ToWave-setCursor', this.cursor.getPos()); // getPos() returns array, of two elements, each element will be one parameter
		}
	};

	/**
	 * @interface
	 * @param  {Object} coords {x: xval, y: yval}}
	 * @return {Boolean}
	 */
	NoteSpaceManager.prototype.inPath = function(coords) {
		return !!this.elemMng.getElemsInPath(this.noteSpace, coords);
	};

	/**
	 * @interface
	 * @param  {CanvasContext} ctx
	 */
	NoteSpaceManager.prototype.drawCursor = function(ctx) {
		if (this.noteSpace.length === 0) return;
		var position = this.cursor.getPos();
		var saveFillColor = ctx.fillStyle;
		ctx.fillStyle = "#0099FF";
		ctx.globalAlpha = 0.2;
		var currentNoteSpace;
		var areas = [];
		var self = this;

		if (position[0] !== null) {
			if (position[0] === position[1]) {
				areas.push({
					x: this.noteSpace[position[0]].position.x,
					y: this.noteSpace[position[0]].position.y,
					w: this.noteSpace[position[0]].position.w,
					h: this.noteSpace[position[0]].position.h
				});
			} else {
				var cursorDims = {
					right: this.MARGIN_RIGHT,
					left: this.MARGIN_LEFT,
					top: 0,
					height: this.HEIGHT
				};
				areas = this.elemMng.getElementsAreaFromCursor(this.noteSpace, position, cursorDims);
			}
			for (i = 0, c = areas.length; i < c; i++) {
				ctx.fillRect(
					areas[i].x,
					areas[i].y,
					areas[i].w,
					areas[i].h
				);
			}
			ctx.fillStyle = saveFillColor;
			ctx.globalAlpha = 1;
		}

	};

	/**
	 * @interface
	 */
	NoteSpaceManager.prototype.isEnabled = function() {
		return this.enabled;
	};

	/**
	 * @interface
	 */
	NoteSpaceManager.prototype.enable = function() {
		this.enabled = true;
	};

	/**
	 * @interface
	 */
	NoteSpaceManager.prototype.disable = function() {
		this.enabled = false;
	};
	/**
	 * @interface
	 */
	NoteSpaceManager.prototype.setCursorEditable = function(bool) {
		this.cursor.setEditable(bool);
	};

	return NoteSpaceManager;
});