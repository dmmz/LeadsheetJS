define([], function() {
	/**
	 * Allow tags to be selected
	 * @exports Tag/TagSpaceView
	 * @param {Array} position : array of objects like {x:10,y:10,w:20,h:20} (this is because an area can inlcude several lines)
	 * @param {String} name     the tag name
	 */
	function TagSpaceView(position, name, color) {
		this.position = position;
		this.name = name;
		this.color = color;
	}

	TagSpaceView.prototype.isInPath = function(coords) {
		coords.xe = coords.xe || coords.x;
		coords.ye = coords.ye || coords.y; //in case xe and ye are not defined, they take the same value a x and y respectively
		var lastPosition = this.position[this.position.length - 1];
		var posXe = lastPosition.x + lastPosition.w;
		var posYe = lastPosition.y + lastPosition.h;
		return (coords.x < posXe && coords.xe > lastPosition.x) && (coords.y < posYe && coords.ye > lastPosition.y);
	};

	TagSpaceView.prototype.isInPathDelete = function(coords) {
		coords.xe = coords.xe || coords.x;
		coords.ye = coords.ye || coords.y; //in case xe and ye are not defined, they take the same value a x and y respectively
		var lastPosition = this.position[this.position.length - 1];
		var posXe = lastPosition.x + lastPosition.w;
		var posYe = lastPosition.y + 20;
		var posX = posXe - 20;
		return (coords.x < posXe && coords.xe > posX) && (coords.y < posYe && coords.ye > lastPosition.y);
	};

	return TagSpaceView;
});