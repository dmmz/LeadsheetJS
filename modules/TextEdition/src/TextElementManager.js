define([
	'modules/TextEdition/src/TextElementView',
	'modules/Edition/src/ElementManager'

	],function(TextElementView, ElementManager){
	function TextElementManager (viewer, songModel) {
		if (!viewer){
			throw "TextElementManager - viewer not defined";
		}
		this.name = 'title';
		this.viewer = viewer;
		this.initSubscribe();	
		this.textView = null;
		this.elemMng = new ElementManager();
		this.songModel = songModel;
	}

	TextElementManager.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('LSViewer-drawEnd', function(el, viewer) {
			if (!viewer.canvasLayer) {
				throw "TextElementManager needs CanvasLayer";
			}
			self.textView  = new TextElementView(viewer.titleView, viewer.scaler);
			viewer.canvasLayer.addElement(self); 
			viewer.canvasLayer.refresh();
		});
	};

	TextElementManager.prototype.isEnabled = function() {
		return true;
	};
	TextElementManager.prototype.draw = function() {
		//do nothing as we have no cursor and no selection
	};
	TextElementManager.prototype.updateCursor = function() {
		var self  = this;
		var inputVal = this.songModel.getTitle();
		var offset = $("#canvas_container canvas").offset();
		if (typeof offset === "undefined" || isNaN(offset.top) || isNaN(offset.left)) {
			offset = {
				top: 0,
				left: 0
			};
		}
		var pos = this.viewer.scaler.getScaledObj(this.textView.getArea());
		var top = pos.y - 1;
		var left = pos.x + offset.left + window.pageXOffset - 1;
		var width = pos.w ;
		var height = pos.h ;
		var input = $('<input/>').attr({
			type: 'text',
			style: "position:absolute; z-index: 11000;left:" + left + "px;top:" + top + "px; width:" + width + "px; height:" + height + "px",
			'class': 'title',
		}).prependTo('#canvas_container');
		input.focus(); // this focus allow setting cursor on end carac
		input.val(inputVal);
		$(input).keyup(function(evt){
			var keyCode = (evt === null) ? event.keyCode : evt.keyCode;
			self.songModel.setTitle($(this).val());
			if (keyCode == 13){
				self.disable();
			}
		});
	};
	TextElementManager.prototype.setCursorEditable = function() {
		//do nothing as we have no cursor
	};
	TextElementManager.prototype.enable = function() {
		//do nothin
	};
	TextElementManager.prototype.disable = function() {
		$.publish('ToViewer-draw', this.songModel);
		$('#canvas_container .title').remove();
	};
	TextElementManager.prototype.inPath = function(coords) {
		return !!this.textView.isInPath(coords);
	};
	// no getYs function because it is not selectable
	return TextElementManager;
});