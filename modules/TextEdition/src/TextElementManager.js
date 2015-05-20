define([
	'modules/TextEdition/src/TextElementView',
	'modules/Edition/src/ElementManager',
	'modules/Edition/src/HtmlInputElement'

	],function(TextElementView, ElementManager, HtmlInputElement){
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

		this.htmlInput = new HtmlInputElement(this.viewer,'title',this.textView.getArea());
		var input = this.htmlInput.input;
		
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
		//do nothing
	};
	TextElementManager.prototype.disable = function() {
		if (this.htmlInput){
			this.htmlInput.remove();
			$.publish('ToViewer-draw', this.songModel);
		}
	};
	TextElementManager.prototype.inPath = function(coords) {
		return !!this.textView.isInPath(coords);
	};
	// no getYs function because it is not selectable
	return TextElementManager;
});