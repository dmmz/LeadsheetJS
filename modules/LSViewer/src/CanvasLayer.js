define(function() {
	function CanvasLayer(viewer) {
		if (!viewer.canvas) {
			throw "LSViewer cannot create layer because canvas does not exist";
		}
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
		this.viewer = viewer;
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


	CanvasLayer.prototype._getXandY = function(element, event) {
		xpos = event.pageX - element.offset().left;
		ypos = event.pageY - element.offset().top;
		return {
			x: xpos,
			y: ypos
		};
	};
	/**
	 * Publish event after receiving dom events
	 */
	CanvasLayer.prototype._listenEvents = function() {
		var self = this,
			xy,
			coords;
		this.mouseDown = false;

		function selection() {
			var elemsActives = [];
			var cursorPos;
			//$.publish('CanvasLayer-updateCursors',self.coords);
			var minY = 999999, maxY = 0, minName, maxName, ys;
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
				self.elems[name].cursor.setPos(null);
				if (minName && maxName){
					
					self.elems[minName].updateCursor(self.coords);
					self.elems[minName].cursor.setEditable(true);
					if (maxName != minName){
						self.elems[maxName].updateCursor(self.coords);
						self.elems[maxName].cursor.setEditable(true);
					}
				}
				//check elems actives
				cursorPos = self.elems[name].cursor.getPos();
				if (cursorPos[0] !== null && cursorPos[1] !== null && self.mouseDown === false) {
					$.publish(name+'-selection', [cursorPos]);
				}
			}
			self.viewer.canvasLayer.refresh(minName,maxName);

		}
		$(this.canvasLayer).mousedown(function(evt) {
			coords = self._getXandY($(this), evt);
			self.mouseCoordsIni = [coords.x, coords.y];
			self._setCoords(self.mouseCoordsIni, self.mouseCoordsIni);
			self.mouseDown = true;
		});
		$(this.canvasLayer).mouseup(function(evt) {
			self.mouseDown = false;
			selection();
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
		$.subscribe('CanvasLayer-refresh',function(){
			//console.log("CanvasLayer-refresh");
			self.viewer.canvasLayer.refresh();
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
	CanvasLayer.prototype.addElement = function(name, elem) {
		this.elems[name] = elem;
	};
	CanvasLayer.prototype.removeElement = function(name) {
		delete this.elems[name];
	};
	CanvasLayer.prototype.refresh = function(name1,name2) {
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.viewer._scale(this.ctx);
		if (name1){
			this.elems[name1].draw(this.ctx);
		}
		if (name2 && name2 != name1){
			this.elems[name2].draw(this.ctx);
		}
		for (var name in this.elems) {
		//	this.elems[name].draw(this.ctx);
			//TODO refactor, we are doing this only to make it work, but it's bad code
			if (typeof this.elems[name].drawCursor === 'function'){
				this.elems[name].drawCursor(this.ctx);
			}
		}

		this.viewer._resetScale(this.ctx);
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