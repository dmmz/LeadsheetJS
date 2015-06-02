define([], function() {

	/**
	 * [TagSpaceView description]
	 * @param {Array} position : array of objects like {x:10,y:10,w:20,h:20} (this is because an area can inlcude several lines)
	 * @param {String} name     the tag name
	 */
	function TagSpaceView(position, name) {
		this.position = position;
		this.name = name;
	}

	//we need to redo function, as position is not anymore an object {x:10, y:10, w:20, h:20} but an array of those objects
	/*TagSpaceView.prototype.isInPath = function(x, y) {
		if (typeof x !== "undefined" && !isNaN(x) && typeof y !== "undefined" && !isNaN(y)) {
			if (this.position.x <= x && x <= (this.position.x + this.position.xe) && this.position.y <= y && y <= (this.position.y + this.position.ye)) {
				return true;
			}
		}
		return false;
	};*/

	return TagSpaceView;
});