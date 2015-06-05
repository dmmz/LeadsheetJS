define([
	'modules/Tag/src/TagSpaceView',
	'modules/Edition/src/ElementManager',
	'jquery',
	'pubsub',
], function(TagSpaceView, ElementManager, $, pubsub) {

	/**
	 * Create and display tags
	 * @param {Object} songModel
	 * @param {Array} tags      Array of object that contain at least a startBeat, a endBeat, can also contain a name
	 * @param {Array} colors    Array of colors in rgba or hexadecimal or html color
	 */
	function TagManager(songModel, noteSpaceManager, tags, colors, isActive) {
		if (!noteSpaceManager.noteSpace){
			throw "TagManager - noteSpaceManager not well initialized";
		}

		this.songModel = songModel;
		this.noteSpaceManager = noteSpaceManager;

		this.tags = tags || [];
		this.colors = colors || ["#559", "#995", "#599", "#595"];
		this.tagSpaces = [];
		this.isActive = (typeof isActive !== "undefined") ? isActive : true;
		
		this.initSubscribe();
		this.elemMng = new ElementManager();
	}

	TagManager.prototype.getTags = function() {
		return this.tags;
	};

	TagManager.prototype.setTags = function(tags) {
		if (typeof tags === "undefined") {
			throw 'TagManager - setTags tags must be an array ' + tags;
		}
		this.tags = tags;
	};

	TagManager.prototype.getColors = function() {
		return this.colors;
	};

	TagManager.prototype.setColors = function(colors) {
		if (typeof colors === "undefined") {
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


	/**
	 * Subscribe to view events
	 */
	TagManager.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('LSViewer-drawEnd', function(el, viewer) {
			self.draw(viewer);
		});

	};

	TagManager.prototype.isInPath = function(x, y) {
		for (var i = 0, c = this.tagSpace.length; i < c; i++) {
			if (typeof this.tagSpace[i] !== "undefined") {
				if (this.tagSpace[i].isInPath(x, y)) {
					return i;
				}
			}
		}
		return false;
	};

	/**
	 * Function takes tags and transform them into TagSpace View that can be displayed on leadsheet,
	 * it basically transform beat position to x, y positions
	 * @param  {Object} viewer LSViewer
	 * @return {Array} array of TagSpaceViews
	 */
	TagManager.prototype.getTagAreas = function(i,viewer) {
		
		var tag;
		var nm = this.songModel.getComponent('notes');
		var fromIndex, toIndex;

		tag = this.tags[i];
		startEnd = nm.getIndexesStartingBetweenBeatInterval(tag.startBeat, tag.endBeat);
		fromIndex = startEnd[0];
		toIndex = startEnd[1];
		return this.elemMng.getElementsAreaFromCursor(this.noteSpaceManager.noteSpace, [fromIndex, toIndex]);
	};

	TagManager.prototype.draw = function(viewer) {
		if (this.isActive !== true) {
			return;
		}
		if (this.tags.length <= 0) {
			return;
		}

		var ctx = viewer.ctx;
		var tagSpaces = [];
		var self = this;
		var areas;

		for (var i = 0; i < self.tags.length; i++) {
			areas = self.getTagAreas(i,viewer);
			if (areas.length === 0){
				console.warn("area not found for "+i+"th tag" );
				continue;
			}
			tagSpaces.push(new TagSpaceView(areas, this.tags[i].name));	
		}

		viewer.drawElem(function() {
	
			var tagSpace;
			var saveFillColor = ctx.fillStyle;
			ctx.font = "15px Arial";
			
			var yDecalToggle = 3;
				var numberOfColors = self.colors.length;
			for (var i = 0; i < tagSpaces.length; i++) {
				ctx.globalAlpha = 0.4;
				tagSpace = tagSpaces[i];
				ctx.fillStyle = self.colors[i % numberOfColors]; // permute colors each time

				for (var j = 0; j < tagSpace.position.length; j++) {
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
					ctx.fillText(tagSpace.name, tagSpace.position[0].x, tagSpace.position[0].y + tagSpace.position[0].h + 12);

			}
			ctx.fillStyle = saveFillColor;
			ctx.globalAlpha = 1;
			
		});
		
	};

	return TagManager;
});