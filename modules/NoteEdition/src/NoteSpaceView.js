define(function() {
	/**
	 * @param {Object} position {x:439.25, y:33,w:10,h:10} //position 
	 * @param {[type]} viewer   [description]
	 */
	function NoteSpaceView(position,viewerScaler) {
		this.position = position;
		this.scaler = viewerScaler;
	}

	/**
	 * @param  {Object}  area can be in two forms :
	 *                        {x: 10, y: 10, xe: 20, ye: 20} / xe and ye are absolute positions (not relative to x and y)
	 *                        {x: 10, y:10}
	 * @return {Boolean}      
	 */
	NoteSpaceView.prototype.isInPath = function(area) {
		area.xe = area.xe || area.x; 
		area.ye = area.ye || area.y; //in case xe and ye are not defined, they take the same value a x and y respectively
		var pos = this.scaler.getScaledObj(this.position),
		posXe = pos.x + pos.w,
		posYe = pos.y + pos.h;
		return (area.x < posXe && area.xe > pos.x) && (area.y < posYe && area.ye > pos.y);
	};

	return NoteSpaceView;
});