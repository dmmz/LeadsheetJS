define(function() {
	var ElementView = {};


	/**
	 * @param  {Object}  area    area can be in two forms :
	 *                           {x: 10, y: 10, xe: 20, ye: 20} / xe and ye are absolute positions (not relative to x and y)
	 *                           {x: 10, y:10}
	 * @param  {Object}  position {x: 2, y: 20}
	 * @param  {Scaler}  scaler
	 * @return {Boolean}
	 */
	ElementView.isInPath = function(area, position, scaler) {
		area.xe = area.xe || area.x;
		area.ye = area.ye || area.y; //in case xe and ye are not defined, they take the same value a x and y respectively
		var pos = scaler.getScaledObj(position),
			posXe = pos.x + pos.w,
			posYe = pos.y + pos.h;
		return (area.x < posXe && area.xe > pos.x) && (area.y < posYe && area.ye > pos.y);
	};

	return ElementView;
});