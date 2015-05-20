define(['modules/Edition/src/TextElementView'],function(TextElementView){
	function TextElementManager (viewer) {
		if (!viewer){
			throw "TextElementManager - viewer not defined";
		}
		this.name = 'title';
		this.viewer = viewer;
		this.initSubscribe();	
		this.textView = null;
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
		//do nothing
	};
	TextElementManager.prototype.inPath = function(coords) {
		return !!this.textView.isInPath(coords)
	};
	return TextElementManager;
});