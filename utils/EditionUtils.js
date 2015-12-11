define(function() {
	var EditionUtils = {};
	/**
	 * getElementsAreaFromCursor
	 * @param  {Array} elems      list of elements
	 * @param  {Array} cursor     [Integer, Integer]
	 * @param  {Object} cursorDims
	 * @return {Array }    Array of Objects that are in this form: {area.x, area.y, area.xe, area.ye}
	 */
	EditionUtils.getElementsAreaFromCursor = function(elems, cursor, cursorDims) {
		
		var areas = [],
			area,
			cInit = cursor[0],
			cEnd = cursor[1];

		if (!cursorDims) {
			cursorDims = {
				right: 0,
				left: 0,
				top: 0,
				height: 0
			};
		}

		if (typeof elems[cInit] === "undefined") {
			return areas;
		}
		var x, y, xe, currElem, currElemY, nextElemY,
			firstElemLine, lastElemLine;

		firstElemLine = elems[cInit];
		while (cInit <= cEnd) {
			currElem = elems[cInit];
			if (typeof currElem.getArea !== 'function'){
				throw "EditionUtils - Error: element passed has no getArea() function";
			}
			currElemY = currElem.getArea().y;

			if (typeof elems[cInit + 1] !== "undefined") {
				nextElemY = elems[cInit + 1].getArea().y;
			}
			if (currElemY != nextElemY || cInit == cEnd) {
				lastElemLine = currElem.getArea();
				x = firstElemLine.getArea().x - cursorDims.left;
				xe = lastElemLine.x - x + lastElemLine.w + cursorDims.right;
				area = {
					x: x,
					y: currElemY + cursorDims.top,
					w: xe,
					h: cursorDims.height || currElem.h
				};
				areas.push(area);
				if (cInit != cEnd) {
					firstElemLine = elems[cInit + 1];
				}
			}
			cInit++;
		}
		return areas;
	};
	return EditionUtils;
});