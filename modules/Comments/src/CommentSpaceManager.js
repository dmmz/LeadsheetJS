define(['modules/Edition/src/ElementManager',
	'modules/Comments/src/CommentSpaceView',
	'jquery'
], function(ElementManager, CommentSpaceView, $) {
	/**
	 * CommentSpaceManager creates and manages an array of comment space
	 * @exports AudioComments/CommentSpaceManager
	 */
	function CommentSpaceManager(viewer) {
		this.commentSpaces = {};
		this.viewer = viewer;
		this.elemMng = new ElementManager();
		this.CL_TYPE = 'CLICKABLE';
		this.CL_NAME = 'AudioComments';
		this.clickedElem = null;
	}
	CommentSpaceManager.prototype.getType = function() {
		return this.CL_TYPE;
	};
	CommentSpaceManager.prototype.addCommentSpace = function(id, commentArea) {
		this.commentSpaces[id] = new CommentSpaceView(id, commentArea, this.viewer.scaler);
	};

	CommentSpaceManager.prototype.inPath = function(coords) {
		var elem = this.elemMng.getOneElemInPath(this.commentSpaces, coords);
		if (elem) {
			this.clickedElem = elem; // we know it will be only one, so pos 0 == pos 1, no matter which one we take
		}
		return !!elem;
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
		$.publish('CommentSpaceManager-clickedComment', this.clickedElem.getId());
	};
	return CommentSpaceManager;
});