define([], function() {

	function TagSpaceView(position, name) {
		this.position = position;
		this.name = name;
	}

	TagSpaceView.prototype.isInPath = function(x, y) {
		if (typeof x !== "undefined" && !isNaN(x) && typeof y !== "undefined" && !isNaN(y)) {
			if (this.position.x <= x && x <= (this.position.x + this.position.xe) && this.position.y <= y && y <= (this.position.y + this.position.ye)) {
				return true;
			}
		}
		return false;
	};

	return TagSpaceView;
});