	/**
	 * CanvasLayer is a canvas place on top of the basic canvas to manage edition and to draw elements such as cursors (to optimize rendering)
	 * @param {LSViewer} viewer 
	 */
define(['jquery','pubsub'], function($, pubsub) {
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
		// we only create it if it does not exist
		if ($("canvas#" + idLayer).length === 0) {
			$("<canvas id='" + idLayer + "' width='" + canvasEl.width() + "' height='" + canvasEl.height() + "'></canvas>").insertAfter(canvasEl);
			canvasLayer = $("#" + idLayer);
			canvasLayer.css(layersProps);
			canvasLayer.css('z-index', 10);
		} else {
			canvasLayer = $("canvas#" + idLayer);
		}
		return canvasLayer;
	};

	CanvasLayer.prototype._getXandY = function(element, event) {
		xpos = event.pageX - element.offset().left;
		ypos = event.pageY - element.offset().top;
		return {
			x: xpos,
			y: ypos
		};
	};

	CanvasLayer.prototype._listenEvents = function() {
		var self = this,
			xy,
			coords;
		this.mouseDown = false;

		function getElemsByYs() {
			var minY = 999999, maxY = 0, minName, maxName, ys;
			var activeElems = [];
			for (var name in self.elems) {
				//self.elems[name].updateCursor([null,null]);
				if (typeof self.elems[name].getYs === 'function'){
					ys = self.elems[name].getYs(self.coords);
					if (ys.topY < minY){
						minY = ys.topY;
						minName = name;
					}
					if (ys.bottomY > maxY){
						maxY = ys.bottomY;
						maxName = name;	
					}
				}
				self.elems[name].cursor.setEditable(false);
				self.elems[name].disable();
			}
			if (minName){
				activeElems.push(self.elems[minName]);
			}
			if (maxName && minName != maxName){
				activeElems.push(self.elems[maxName]);
			}
			return activeElems;
		}

		function selection(mouseUp) {
			var cursorPos,
				activElems = getElemsByYs();
			for (var i in activElems){
				activElems[i].updateCursor(self.coords,mouseUp);
				activElems[i].cursor.setEditable(true);
				activElems[i].enable();
			}
			self.viewer.canvasLayer.refresh();
		}

		$(this.canvasLayer).mousedown(function(evt) {
			coords = self._getXandY($(this), evt);
			self.mouseCoordsIni = [coords.x, coords.y];
			self._setCoords(self.mouseCoordsIni, self.mouseCoordsIni);
			self.mouseDown = true;
		});
		$(this.canvasLayer).mouseup(function(evt) {
			self.mouseDown = false;
			selection(true);
		});
		$(this.canvasLayer).mousemove(function(evt) {
			//draw cursor selection
			var xy = self._getXandY($(this), evt);
			if (self.mouseDown) {
				var ctx = self.ctx;
				self.mouseCoordsEnd = [xy.x, xy.y];
				self._setCoords(self.mouseCoordsIni, self.mouseCoordsEnd);
				selection();
			}
			$.publish('CanvasLayer-mousemove', xy);
		});
		$.subscribe('CanvasLayer-refresh',function(el,name){
			self.viewer.canvasLayer.refresh(name);
		});

	};


	CanvasLayer.prototype._setCoords = function(mouseCoordsIni, mouseCoordsEnd) {

		function get(xory, type) {
			var evaluation;
			var num = (xory == "x") ? 0 : 1;
			if (type == "smaller") evaluation = (mouseCoordsIni[num] < mouseCoordsEnd[num]);
			else if (type == "greater") evaluation = (mouseCoordsIni[num] > mouseCoordsEnd[num]);
			else throw "not valid argument";

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
	 */
	CanvasLayer.prototype.addElement = function(elem) {
		if (!elem || !elem.name){
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
			if (this.elems[name].isEnabled()){
				this.elems[name].draw(this.ctx);
			}
			//TODO refactor, we are doing this only to make it work, but it's bad code
			if (typeof this.elems[name].drawCursor === 'function'){
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