define(function() {
	function CanvasLayer(viewer){
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
		this._init();
		this._listenEvents(canvasLayer);
	}

	CanvasLayer.prototype._init = function() {
		this.color = "rgba(0,0,255,1)";
		this.mouseCoordsIni = null;
		this.mouseCoordsEnd = null;
		this.coords = {};
	};

	CanvasLayer.prototype._getXandY= function(element, event) {
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
			mouseDown = false,
			coords;
		
		$(this.canvasLayer).mousedown(function(evt) {
			coords = self._getXandY($(this),evt);
			self.mouseCoordsIni = [coords.x,coords.y];
			self._setCoords(self.mouseCoordsIni,self.mouseCoordsIni);
			mouseDown = true;
		});
		$(this.canvasLayer).mouseup(function(evt) {
			mouseDown = false;
			var ctx = self.viewer.layerCtx;
			ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);//reset
			$.publish('CanvasLayer-selection', self.coords);	
		});
		$(this.canvasLayer).mousemove(function(evt) {
			//draw cursor selection
			var xy = self._getXandY($(this),evt);
			if (mouseDown)
			{
				var ctx = self.viewer.layerCtx;
				self.mouseCoordsEnd = [xy.x,xy.y];
				self._setCoords(self.mouseCoordsIni,self.mouseCoordsEnd);
				ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);//reset
				ctx.strokeStyle = self.color;
				ctx.strokeRect(self.coords.x,self.coords.y,self.coords.xe-self.coords.x,self.coords.ye-self.coords.y);
				$.publish('CanvasLayer-selection', self.coords);	
			}
			$.publish('CanvasLayer-mousemove', xy);
		});

		
	};

	CanvasLayer.prototype._setCoords = function(mouseCoordsIni,mouseCoordsEnd) {

		function get(xory,type)
		{
			var evaluation;
			var num=(xory=="x") ? 0 : 1;
			if (type=="smaller")	evaluation=(mouseCoordsIni[num]<mouseCoordsEnd[num]);
			else if (type=="greater")	evaluation=(mouseCoordsIni[num]>mouseCoordsEnd[num]);
			else throw "not valid argument";
			
			return   evaluation ? mouseCoordsIni[num] : mouseCoordsEnd[num];
		}
		this.coords.x = get("x","smaller");
		this.coords.y = get("y","smaller");
		this.coords.xe = get("x","greater");
		this.coords.ye = get("y","greater");

	};

	CanvasLayer.prototype.getCanvas = function() {
		return this.canvasLayer;
	};
	return CanvasLayer;
});