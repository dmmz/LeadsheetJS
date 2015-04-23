define([], function() {

	function NoteSpaceView(position,viewer) {
		this.position = position;
		this.viewer = viewer;
	}

	NoteSpaceView.prototype.isInPath = function(x, y) {
		var pos = this.viewer.getScaledObj(this.position);
		if (typeof x !== "undefined" && !isNaN(x) && typeof y !== "undefined" && !isNaN(y)) {
			if (pos.x <= x && x <= (pos.x + pos.xe) && pos.y <= y && y <= (pos.y + pos.ye)) {
				return true;
			}
		}
		return false;
	};

	return NoteSpaceView;
});