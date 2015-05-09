define(['modules/Edition/src/ElementView'], function(ElementView) {
	/**
	 * @param {Object} position {x:439.25, y:33,w:10,h:10} //position
	 * @param {[type]} viewer   [description]
	 */
	function NoteSpaceView(position, viewerScaler) {
		this.position = position;
		this.scaler = viewerScaler;
	}

	NoteSpaceView.prototype.isInPath = function(coords) {
		return ElementView.isInPath(coords, this.position, this.scaler);
	};

	NoteSpaceView.prototype.getArea = function() {
		return this.position;
	};

	return NoteSpaceView;
});