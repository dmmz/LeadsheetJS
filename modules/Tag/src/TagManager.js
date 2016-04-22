define([
	'modules/Tag/src/TagSpaceView',
	'modules/Tag/src/Tag',
	'modules/Tag/src/NotesTag',
	'modules/Tag/src/ChordsTag',
	'jquery',
	'pubsub',
], function(TagSpaceView, Tag, NotesTag, ChordsTag, $, pubsub) {
	/**
	 * Create and display tags
	 * @exports Tag/TagManager
	 * @param {Object} songModel
	 * @param {Array} tags      Array of object that contain at least a startBeat, a endBeat, can also contain a name
	 * @param {Array} colors    Array of colors in rgba or hexadecimal or html color
	 * @param {Boolean} isActive    Indicates if we draw it or not
	 * @param {Boolean} isEditable  Indicates if it's editable or not
	 */
	/**
	 * [TagManager description]
	 * @param {SongModel}  songModel  
	 * @param {[type]}  elems      [description]
	 * @param {[type]}  tags       [description]
	 * @param {[type]}  colors     [description]
	 * @param {Boolean} isActive   [description]
	 * @param {Boolean} isEditable [description]
	 */
	function TagManager(songModel, elemManagers, tags, colors, isActive, isEditable) {
		if (!songModel || !elemManagers  || (!elemManagers.notes && !elemManagers.chords)){
			throw "TagManager- missing params";
		}

		this.songModel = songModel;
		this.chordSpaceManager 	= elemManagers.chords;
		this.noteSpaceManager 	= elemManagers.notes;

		this.CL_NAME = 'TagManager';
		this.CL_TYPE = 'CLICKABLE';
		
		this.colorMap = [];
		this.colors = colors || ["#559", "#995", "#599", "#595"];
		this.tagSpaces = [];
		this.isActive = (isActive !== undefined) ? isActive : true;
		this.isEditable = (isEditable !== undefined) ? isEditable : false;
		this.setTags(tags);
		this.initSubscribe();
	}
	TagManager.prototype.tagCreate = function(tag) {
		tag.type = tag.type || 'notes';
		if (tag.type == 'notes'){
			return new NotesTag(tag, this.songModel, this.noteSpaceManager);
		}else{ //chords
			return new ChordsTag(tag, this.songModel, this.chordSpaceManager);
		}
	};

	TagManager.prototype.getType = function() {
		return this.CL_TYPE;
	};

	TagManager.prototype.getTags = function() {
		return this.tags;
	};

	TagManager.prototype.setTags = function(tags) {

		this.tags = [];
		if (tags === undefined) {
			throw 'TagManager - setTags tags must be an array ';
		}
		for (var i = 0; i < tags.length; i++) {
			this.tags.push(this.tagCreate(tags[i]));
		}
	};

	TagManager.prototype.getColors = function() {
		return this.colors;
	};

	TagManager.prototype.setColors = function(colors) {
		if (colors === undefined) {
			throw 'TagManager - setColors colors must be an array ' + colors;
		}
		this.colors = colors;
		//$.publish('TagManager-setColors', this);
	};

	TagManager.prototype.setActive = function(active) {
		this.isActive = !!active;
	};

	TagManager.prototype.getActive = function() {
		return this.isActive;
	};

	TagManager.prototype.onSelected = function(coords) {
		var indexTagClicked = this.inPathPosition(coords);
		// console.log(indexTagClicked);
		var self = this;
		if (this.tagSpaces[indexTagClicked].isInPathDelete(coords)) {
			//console.log('delete', indexTagClicked);
			this.tags.splice(indexTagClicked, 1);
			$.publish('ToViewer-draw', self.songModel);
		}
	};


	TagManager.prototype.isEnabled = function() {
		return true;
	};
	TagManager.prototype.enable = function() {};
	TagManager.prototype.disable = function() {};

	/**
	 * Subscribe to view events
	 */
	TagManager.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('LSViewer-drawEnd', function(el, viewer) {
			self.drawTags(viewer);
			//	commented as for the moment it is not interactive
			// if (self.noteSpaceManager.viewer.canvasLayer) {
			// 	self.noteSpaceManager.viewer.canvasLayer.addElement(self);
			// }
		});

	};

	TagManager.prototype.isEnabled = function() {
		return this.isActive;
	};

	TagManager.prototype.inPathPosition = function(coords) {
		for (var i = 0, c = this.tagSpaces.length; i < c; i++) {
			if (typeof this.tagSpaces[i] !== "undefined") {
				if (this.tagSpaces[i].isInPath(coords)) {
					return i;
				}
			}
		}
		return false;
	};

	TagManager.prototype.inPath = function(coords) {
		return false;
		//for the moment, tagManager is not clickable. We return false so that CanvasLayer's getOneActiveElement function returns noteManager as active element, and not tagManager
	
		// if (this.inPathPosition(coords) === false) {
		// 	return false;
		// }
		// return true;
	};

	/**
	 * Function takes tags and transform them into TagSpace View that can be displayed on leadsheet,
	 * it basically transform beat position to x, y positions
	 * @param  {Object} viewer LSViewer
	 * @return {Array} array of TagSpaceViews
	 */
	TagManager.prototype.getTagAreas = function(i) {
		return this.tags[i].getArea();
		
		/*var tag;
		var nm = this.songModel.getComponent('notes');
		var fromIndex, toIndex;

		tag = this.tags[i];
		startEnd = nm.getIndexesStartingBetweenBeatInterval(tag.startBeat, tag.endBeat, true);
		fromIndex = startEnd[0];
		toIndex = startEnd[1];
		
		return this.elemMng.getElementsAreaFromCursor(this.elems, [fromIndex, toIndex]);*/
	};

	TagManager.prototype.drawTags = function(viewer) {
		if (this.isActive !== true) {
			return;
		}
		if (this.tags.length <= 0) {
			return;
		}

		var ctx = viewer.ctx;
		this.tagSpaces = [];
		var self = this;
		var areas;

		var numberOfColors = self.colors.length;
		var color;
		for (var i = 0; i < self.tags.length; i++) {
			areas = self.getTagAreas(i, viewer);
			if (areas.length === 0) {
				console.warn("area not found for " + i + "th tag");
				continue;
			}
			if (typeof this.tags[i].color !== "undefined") {
				color = this.tags[i].color;
			} else {
				color = this.colors[this.tagSpaces.length % numberOfColors]; // permute colors each time
			}
			this.tagSpaces.push(new TagSpaceView(areas, this.tags[i].name, color));
		}

		viewer.drawElem(function() {

			var tagSpace;
			var saveFillColor = ctx.fillStyle;
			ctx.font = "15px Arial";

			var yDecalToggle = 3;
			for (var i = 0; i < self.tagSpaces.length; i++) {
				ctx.globalAlpha = 0.4;
				tagSpace = self.tagSpaces[i];
				ctx.fillStyle = tagSpace.color;

				var numberOfTagPosition = tagSpace.position.length;
				for (var j = 0; j < numberOfTagPosition; j++) {
					//this makes shift a bit tags , useful in case they overlap
					if (i % 2) {
						tagSpace.position[j].y += yDecalToggle;
						tagSpace.position[j].h += yDecalToggle;
					} else {
						tagSpace.position[j].y -= yDecalToggle;
						tagSpace.position[j].h -= yDecalToggle;
					}
					//we paint the area
					ctx.fillRect(
						tagSpace.position[j].x,
						tagSpace.position[j].y,
						tagSpace.position[j].w,
						tagSpace.position[j].h
					);
				}
				//we write the tag name
				ctx.globalAlpha = 1;
				ctx.fillStyle = "black";
				if (typeof tagSpace.name !== "undefined") {
					ctx.fillText(tagSpace.name, tagSpace.position[0].x, tagSpace.position[0].y + tagSpace.position[0].h + 15);
				}

				if (self.isEditable === true) {
					ctx.fillStyle = "#666";
					ctx.fillRect(
						tagSpace.position[numberOfTagPosition - 1].x + tagSpace.position[numberOfTagPosition - 1].w - 20,
						tagSpace.position[numberOfTagPosition - 1].y,
						20,
						20
					);
					ctx.fillStyle = "#eee";
					ctx.fillText('X', tagSpace.position[numberOfTagPosition - 1].x + tagSpace.position[numberOfTagPosition - 1].w - 20 + 6, tagSpace.position[numberOfTagPosition - 1].y + 19);
				}
			}
			ctx.fillStyle = saveFillColor;
			ctx.globalAlpha = 1;

		});

	};


	// no getYs function because it is not selectable
	return TagManager;
});4