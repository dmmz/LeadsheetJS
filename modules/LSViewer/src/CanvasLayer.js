/**
 * CanvasLayer is a canvas place on top of the basic canvas to manage edition and to draw elements such as cursors (to optimize rendering)
 * @param {LSViewer} viewer
 */
define(['jquery', 'pubsub'], function($, pubsub) {
	function CanvasLayer(viewer) {
		if (!viewer.canvas) {
			throw "LSViewer cannot create layer because canvas does not exist";
		}

		this.viewer = viewer;
		var canvasLayer = this._createLayer(viewer);
		this.canvasLayer = canvasLayer[0];
		this.ctx = canvasLayer[0].getContext('2d');
		this.color = "rgba(0,0,255,1)";
		this.mouseCoordsIni = null;
		this.mouseCoordsEnd = null;
		this.coords = {};
		this.mouseDown = false;
		this._listenEvents(canvasLayer);
		this.elems = {};
	}

	CanvasLayer.prototype._createLayer = function(viewer) {
		var canvasEl = $(viewer.canvas),
			idCanvas = canvasEl.attr('id'),
			idLayer = idCanvas + "-layer",
			offset = canvasEl.offset(),
			//top depends on the position (absolute, static..) of the canvas container element
			top = (canvasEl.parent().css("position") == "absolute") ? 0 : offset.top;

		var layersProps = {
			position: "absolute",
			left: offset.left,
			top: top
		};
		var canvasLayer;
		//we remove it, to create a new one (_createLayer it's called only at the beginning or when resizing)
		if ($("canvas#" + idLayer).length !== 0) {
			$("canvas#" + idLayer).remove();
		}
		$("<canvas id='" + idLayer + "' width='" + canvasEl.width() + "' height='" + canvasEl.height() + "'></canvas>").insertAfter(canvasEl);
		canvasLayer = $("#" + idLayer);
		canvasLayer.css(layersProps);
		canvasLayer.css('z-index', 10);
		return canvasLayer;
	};

	CanvasLayer.prototype._getXandY = function(element, event) {
		return {
			x: event.pageX - element.offset().left,
			y: event.pageY - element.offset().top
		};
	};

	CanvasLayer.prototype._listenEvents = function() {
		var self = this,
			xy,
			coords;
		this.mouseDown = false;
		/**
		 * when selecting we need to know which kind of elements (being normally notes, chords or audio), are at the top and at the bottom of the selection.
		 * We will decide by that, which elements will be editable. So far, we take maximum two.
		 * E.g.1 if notes at top and notes at bottom of selection, we only enable edition for notes (even if there are chords in the middle)
		 * E.g.2 if notes at top and chords at bottom of selection, we enable edition on notes and chords at the same time.
		 * @param  {Object} coords e.g.:  {x:12, y:21}
		 *
		 * @return {Array}        array of active elements (being elements like ChordSpaceManager, NoteSpaceManager, WaveDrawer. TextElementManager will never be returned because it is not selectable (it does not have getY() function), it is only thought for being clicked)
		 */
		function getElemsByYs(coords) {
			var minY = 999999,
				maxY = 0,
				minName, maxName, ys;
			var activeElems = [];
			for (var name in self.elems) {
				//self.elems[name].updateCursor([null,null]);
				if (typeof self.elems[name].getYs === 'function') {
					ys = self.elems[name].getYs(coords);
					if (ys.topY < minY) {
						minY = ys.topY;
						minName = name;
					}
					if (ys.bottomY > maxY) {
						maxY = ys.bottomY;
						maxName = name;
					}
				}
			}
			if (minName) {
				activeElems.push(self.elems[minName]);
			}
			if (maxName && minName != maxName) {
				activeElems.push(self.elems[maxName]);
			}
			return activeElems;
		}

		/**
		 * when clicking on an element we will select one only element, this function chooses which one depending on coords
		 * @param  {Object} coords  e.g.:  {x:12, y:21}
		 * @return {Object}        class of active element (ChordSpaceManager, NoteSpaceManager, WaveDrawer. TextElementManager...etc.)
		 */
		function getOneActiveElement(coords) {
			for (var name in self.elems) {
				if (self.elems[name].inPath(coords)) {
					return [self.elems[name]];
				}
			}
		}

		function resetElems() {
			for (var name in self.elems) {
				if (self.elems[name].cursor) {
					self.elems[name].setCursorEditable(false);
				}
				self.elems[name].disable();
			}
		}

		/**
		 * [selection description]
		 * @param  {Boolean} clicked true when clicked (mouseDown and mouseUp in same position) false when moved mouse onMouseDown
		 */
		function selection(clicked, mouseUp) {
			var cursorPos;
			resetElems();
			var activElems;
			if (clicked) {
				activElems = getOneActiveElement(self.coords);
			} else {
				activElems = getElemsByYs(self.coords);
			}
			for (var i in activElems) {
				activElems[i].updateCursor(self.coords, clicked, mouseUp);
				activElems[i].setCursorEditable(true);
				activElems[i].enable();
			}
			self.refresh();
		}

		/**
		 * cursor set to pointer to indicate when an element is clickable. Before it was managed by each element edition class (notes,chords...etc.) but we moved it here
		 * because it has to be centralized otherwise events were interfering to each other (notes pointer when mouse is over notes would not work if at the same time chords editor asks to set pointer to default when mouse is not over chords)
		 * @param {Object} xy  e.g.:  {x:12, y:21}
		 */
		function setPointerIfInPath(xy) {
			if (typeof self.viewer.divContainer.style !== 'undefined') {
				var found = false;
				for (var name in self.elems) {
					if (typeof self.elems[name].inPath !== 'function') {
						continue;
					}
					if (self.elems[name].inPath(xy)) {
						self.viewer.divContainer.style.cursor = 'pointer';
						found = true;
					}
				}
				if (!found) {
					self.viewer.divContainer.style.cursor = 'default';
				}
			}
		}
		$(this.canvasLayer).mousedown(function(evt) {
			coords = self._getXandY($(this), evt);
			self.mouseCoordsIni = [coords.x, coords.y];
			self._setCoords(self.mouseCoordsIni, self.mouseCoordsIni);
			self.mouseDown = true;
		});

		//we prevent default mouse right-click
		document.oncontextmenu = function() {
			return false;
		};
		// Mouseup on canvas is usefull to allow unselect
		$(this.canvasLayer).mouseup(function(evt) {
			self.mouseDown = false;
			var isClick = self.mouseDidntMove();
			if (isClick && evt.button == 2){
				$.publish('right-click');
			}else{
				selection(isClick, true);	
			}
		});

		// Mouseup on the whole page allows user to go out of the canvas when he selects (it only work in case a mousemove happened)
		$('html').mouseup(function(evt) {
			if (self.mouseDown === true) {
				self.mouseDown = false;
				selection(self.mouseDidntMove(), true);
			}
		});

		$('html').mousemove(function(evt) {
			//draw cursor selection
			var xy = self._getXandY($(self.canvasLayer), evt);
			if (self.mouseDown) {
				var ctx = self.ctx;
				self.mouseCoordsEnd = [xy.x, xy.y];
				self._setCoords(self.mouseCoordsIni, self.mouseCoordsEnd);
				self._clampCoords($(self.canvasLayer));
				selection();
			}
			setPointerIfInPath(xy);
		});

		$.subscribe('CanvasLayer-refresh', function(el) {
			self.refresh();
		});
	};

	/**
	 * true if position on mouseDown is the same (or almost) as position on mouseUp
	 * @return {Booelan}
	 */
	CanvasLayer.prototype.mouseDidntMove = function() {
		return (Math.abs(this.coords.x - this.coords.xe) < 5 && Math.abs(this.coords.y - this.coords.ye) < 5);
	};

	CanvasLayer.prototype._clampCoords = function(element) {
		xeElement = element.width();
		yeElement = element.height();
		if (this.coords.x < 0) {
			this.coords.x = 1;
		}
		if (this.coords.y < 0) {
			this.coords.y = 1;
		}
		if (this.coords.xe > xeElement) {
			this.coords.xe = Math.floor(xeElement) - 1;
		}
		if (this.coords.ye > yeElement) {
			this.coords.ye = Math.floor(yeElement) - 1;
		}
	};

	CanvasLayer.prototype._setCoords = function(mouseCoordsIni, mouseCoordsEnd) {

		function get(xory, type) {
			var evaluation;
			var num = (xory == "x") ? 0 : 1;
			if (type == "smaller") evaluation = (mouseCoordsIni[num] < mouseCoordsEnd[num]);
			else if (type == "greater") evaluation = (mouseCoordsIni[num] > mouseCoordsEnd[num]);
			return evaluation ? mouseCoordsIni[num] : mouseCoordsEnd[num];
		}
		this.coords.x = get("x", "smaller");
		this.coords.y = get("y", "smaller");
		this.coords.xe = get("x", "greater");
		this.coords.ye = get("y", "greater");

	};

	CanvasLayer.prototype.getCanvas = function() {
		return this.canvasLayer;
	};
	/**
	 * Elements to draw
	 * @param {String} name
	 * @param {Model} elem any model that has a draw function receiving a ctx
	 *
	 * Element class should have several arguments
	 * name
	 * and several functions:
	 * getYs
	 * updateCursor
	 * inPath
	 * draw
	 * isEnabled
	 * enable
	 * disable
	 * setCursorEditable
	 */
	CanvasLayer.prototype.addElement = function(elem) {
		if (!elem || !elem.name) {
			throw 'CanvasLayer element needs name property';
		}
		this.elems[elem.name] = elem;
	};
	/**
	 * Refresh canvas layer: all elements in canvas layer should be elements cursors or elements that change fast
	 */
	CanvasLayer.prototype.refresh = function() {
		//console.log('refresh');
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.viewer.scale(this.ctx);
		// console.log(name1+","+name2);
		// console.log(this.elems);
		for (var name in this.elems) {
			if (this.elems[name].isEnabled()) {
				//drawing cursor for notesManager, chordsManager and WaveManager (selection cursor)
				this.elems[name].draw(this.ctx);
			}
			//TODO refactor, drawCursor only exists in WaveManager to draw playing cursor
			if (typeof this.elems[name].drawCursor === 'function') {
				this.elems[name].drawCursor(this.ctx);
			}
		}
		this.viewer.resetScale(this.ctx);
		if (this.mouseDown) {
			var style = this.ctx.strokeStyle;
			this.ctx.strokeStyle = this.color;
			this.ctx.strokeRect(
				this.coords.x,
				this.coords.y,
				this.coords.xe - this.coords.x,
				this.coords.ye - this.coords.y
			);
			this.ctx.strokeStyle = style;
		}

	};
	return CanvasLayer;
});