define(['modules/Edition/src/ElementManager',
	'modules/AudioComments/src/CommentSpaceView'
], function(ElementManager, CommentSpaceView) {
	function CommentSpaceManager(viewer) {
		this.commentSpaces = [];
		this.viewer = viewer;
		this.elemMng = new ElementManager();
		this.CL_TYPE = 'CLICKABLE';
		this.CL_NAME = 'AudioComments';
		viewer.canvasLayer.addElement(this);
		this.clickedElem = null;
	}
	CommentSpaceManager.prototype.getType = function() {
		return this.CL_TYPE;
	};
	CommentSpaceManager.prototype.addCommentSpace = function(commentArea) {
		this.commentSpaces.push(new CommentSpaceView(commentArea, this.viewer.scaler));
	};

	CommentSpaceManager.prototype.inPath = function(coords) {
		var elems = this.elemMng.getElemsInPath(this.commentSpaces, coords);
		if (elems) {
			this.clickedElem = elems[0]; // we know it will be only one, so pos 0 == pos 1, no matter which one we take
		}
		return !!elems;
	};

	CommentSpaceManager.prototype.enable = function() {
		//do nothing
	};

	CommentSpaceManager.prototype.disable = function() {
		//do nothing
	};
	CommentSpaceManager.prototype.isEnabled = function() {
		return true;
	};

	CommentSpaceManager.prototype.onSelected = function() {
		$.publish('clicked-comment', this.clickedElem);
	};
	return CommentSpaceManager;
});