define([
	'modules/Tag/src/TagSpaceView',
	'pubsub',
], function(TagSpaceView, pubsub) {

	/**
	 * Create and display tags
	 * @param {Object} songModel
	 * @param {Array} tags      Array of object that contain at least a startBeat, a endBeat, can also contain a name
	 * @param {Array} colors    Array of colors in rgba or hexadecimal or html color
	 */
	function TagManager(songModel, tags, colors) {
		this.songModel = songModel;
		this.tags = (typeof tags !== "undefined") ? tags : [];
		this.colors = (typeof colors !== "undefined") ? colors : ["#559", "#995", "#599", "#595"];
		this.tagSpace = [];
		this.isActive = true;
		this.initSubscribe();
		this.CURSORHEIGHT = 80;
		this.CURSORMARGINTOP = 20;
		this.CURSORMARGINLEFT = 6;
		this.CURSORMARGINRIGHT = 9;
	}

	TagManager.prototype.getTags = function() {
		return this.tags;
	};

	TagManager.prototype.setTags = function(tags) {
		if (typeof tags === "undefined") {
			throw 'TagManager - setTags tags must be an array ' + tags;
		}
		this.tags = tags;
		$.publish('TagManager-setTags', this);
		$.publish('ToViewer-draw', this.songModel);
	};

	TagManager.prototype.getColors = function() {
		return this.colors;
	};

	TagManager.prototype.setColors = function(colors) {
		if (typeof colors === "undefined") {
			throw 'TagManager - setColors colors must be an array ' + colors;
		}
		this.colors = colors;
		$.publish('TagManager-setColors', this);
		$.publish('ToViewer-draw', this.songModel);
	};

	TagManager.prototype.setActive = function(active) {
		this.isActive = !!active;
		$.publish('ToViewer-draw', this.songModel);
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
		/*$.subscribe('LSViewer-click', function(el, position) {
			var inPath = self.isInPath(position.x, position.y);
			console.log(inPath);
			if (inPath !== false) {
				$.publish('ToViewer-draw', self.songModel);
			}
		});*/
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
	 * @return {Array} array of TagSpaceView
	 */
	TagManager.prototype.getTagsAreas = function(viewer) {
		var areas = [];
		var area = {};
		var startEnd, fromIndex, toIndex, xi, yi, xe;
		var currentNote, currentNoteStaveY, nextNoteStaveY;
		var firstNoteLine, lastNoteLine;
		var nm = this.songModel.getComponent('notes');
		var tagName = '';
		for (var i = 0, c = this.tags.length; i < c; i++) {
			startEnd = nm.getIndexesStartingBetweenBeatInterval(this.tags[i].startBeat, this.tags[i].endBeat - 1);
			fromIndex = startEnd[0];
			toIndex = startEnd[1];
			if (typeof viewer.vxfNotes[fromIndex] === "undefined" || typeof viewer.vxfNotes[toIndex] === "undefined") {
				return areas;
			}
			firstNoteLine = viewer.vxfNotes[fromIndex];
			while (fromIndex <= toIndex) {
				currentNote = viewer.vxfNotes[fromIndex];
				currentNoteStaveY = currentNote.stave.y;
				if (typeof viewer.vxfNotes[fromIndex + 1] !== "undefined") {
					nextNoteStaveY = viewer.vxfNotes[fromIndex + 1].stave.y;
				}
				if (currentNoteStaveY != nextNoteStaveY || fromIndex == toIndex) {
					lastNoteLine = currentNote.getBoundingBox();
					xi = firstNoteLine.getBoundingBox().x - this.CURSORMARGINLEFT;
					xe = lastNoteLine.x - xi + lastNoteLine.w + this.CURSORMARGINRIGHT;
					area = {
						x: xi,
						y: currentNoteStaveY + this.CURSORMARGINTOP,
						xe: xe,
						ye: this.CURSORHEIGHT
					};
					tagName = '';
					if (typeof this.tags[i].name !== "undefined") {
						tagName = this.tags[i].name;
					}
					areas.push(new TagSpaceView(area, tagName));
					if (fromIndex != toIndex) {
						firstNoteLine = viewer.vxfNotes[fromIndex + 1];
					}
				}

				fromIndex++;
			}
		}
		return areas;
	};


	TagManager.prototype.draw = function(viewer) {
		if (this.isActive !== true) {
			return;
		}
		if (this.tags.length <= 0) {
			return;
		}

		var saveFillColor = viewer.ctx.fillStyle;
		viewer.ctx.font = "15px Arial";
		this.tagSpace = this.getTagsAreas(viewer);
		var yDecalToggle = 3;
		var numberOfColors = this.colors.length;
		for (var i = 0, c = this.tagSpace.length; i < c; i++) {
			viewer.ctx.globalAlpha = 0.4;
			viewer.ctx.fillStyle = this.colors[i % numberOfColors]; // permute colors each time
			if (i % 2) {
				this.tagSpace[i].position.y += yDecalToggle;
				this.tagSpace[i].position.ye += yDecalToggle;
			} else {
				this.tagSpace[i].position.y -= yDecalToggle;
				this.tagSpace[i].position.ye -= yDecalToggle;
			}
			viewer.ctx.fillRect(
				this.tagSpace[i].position.x,
				this.tagSpace[i].position.y,
				this.tagSpace[i].position.xe,
				this.tagSpace[i].position.ye
			);
			viewer.ctx.globalAlpha = 1;
			viewer.ctx.fillStyle = "black";
			viewer.ctx.fillText(this.tagSpace[i].name, this.tagSpace[i].position.x, this.tagSpace[i].position.y + this.tagSpace[i].position.ye + 12);
		}
		viewer.ctx.fillStyle = saveFillColor;
		viewer.ctx.globalAlpha = 1;
	};

	return TagManager;
});