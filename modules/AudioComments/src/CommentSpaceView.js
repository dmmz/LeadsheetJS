define(['modules/Edition/src/ElementView'], function(ElementView) {
	/**
	 * CommentSpaceView allow comments to be clickable
	 * This object is created by CommentSpaceManager
	 * @exports AudioComments/CommentSpaceView
	 * @param {Object} position {x:439.25, y:33,w:10,h:10} //position
	 * @param {Scaler} viewerScaler
	 */
	function CommentSpaceView(id, position, viewerScaler) {
		this.id = id;
		this.position = position;
		this.scaler = viewerScaler;
		this.shown = false;
	}
	/**
	 * @interface
	 * @param  {Object}  coords [description]
	 * @return {Boolean}        [description]
	 */
	CommentSpaceView.prototype.isInPath = function(coords) {
		return ElementView.isInPath(coords, this.position, this.scaler);
	};
	/**
	 * @interface
	 */
	CommentSpaceView.prototype.getArea = function() {
		return this.position;
	};

	CommentSpaceView.prototype.getId = function() {
		return this.id;
	};
	return CommentSpaceView;
});