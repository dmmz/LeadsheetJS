define([
	'jquery',
	'pubsub',
	'modules/TextEdition/src/TextElementView',
	'modules/Edition/src/HtmlInputElement'
], function($, pubsub, TextElementView, HtmlInputElement) {

	function TextElementManager(viewer, songModel) {
		if (!viewer) {
			throw "TextElementManager - viewer not defined";
		}
		this.CL_NAME = 'title';
		this.CL_TYPE = 'CLICKABLE';
		this.viewer = viewer;
		this.initSubscribe();
		this.textView = null;
		this.songModel = songModel;
	}

	TextElementManager.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('LSViewer-drawEnd', function(el, viewer) {
			// If Lsviewer doesn't have a canvas layer we do nothing, otherwise we need to update textelement
			if (viewer.canvasLayer) {
				//throw "TextElementManager needs CanvasLayer";
				self.textView = new TextElementView(viewer.titleView, viewer.scaler);
				viewer.canvasLayer.addElement(self);
				viewer.canvasLayer.refresh();
			}
		});
	};
	TextElementManager.prototype.getType = function() {
		return this.CL_TYPE;
	};

	TextElementManager.prototype.isEnabled = function() {
		return true;
	};

	TextElementManager.prototype.onSelected = function() {
		var self = this;
		var inputVal = this.songModel.getTitle();

		this.htmlInput = new HtmlInputElement(this.viewer, 'title', this.textView.getArea());
		var input = this.htmlInput.input;

		input.focus(); // this focus allow setting cursor on end carac
		input.val(inputVal);
		$(input).keyup(function(evt) {
			var keyCode = (evt === null) ? event.keyCode : evt.keyCode;
			self.songModel.setTitle($(this).val());
			if (keyCode == 13) {
				self.disable();
			}
		});
	};
	TextElementManager.prototype.enable = function() {
		//do nothing
	};
	TextElementManager.prototype.disable = function() {
		if (this.htmlInput) {
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