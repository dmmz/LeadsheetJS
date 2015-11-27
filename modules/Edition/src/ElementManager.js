define(function() {
	/**
	 * Abstraction class, used by NoteSpaceManager and ChordSpaceManager (by composition rather than heritage)
	 */
	function ElementManager() {}

	/*
	 * @param  {Array} ini Array of two numbers representing x and y ([x,y]), represents the initial position (where user clicked initially on selection)
	 * @param  {[type]} end  Exactly the same as ini, but represents the end position (where user did mousup after dragging on selection),
	 * @return {Boolean}     
	 */
	ElementManager.prototype.fromLeftBottom2TopRight = function(ini,end) {
		return ini[0] < end[0] && ini[1] > end[1];
	};

	/*
	 * @param  {Array} ini Array of two numbers representing x and y ([x,y]), represents the initial position (where user clicked initially on selection)
	 * @param  {[type]} end  Exactly the same as ini, but represents the end position (where user did mousup after dragging on selection),
	 * @return {Boolean}     
	 */
	ElementManager.prototype.fromTopRight2BottomLeft = function(ini,end) {
		return ini[0] > end[0] && ini[1] < end[1];
	};
	
	/**
	 * [includesMultipleLines description]
	 * @param  {Object} ys Has ys delimiting selection. e.g.:{bottomY: 12, topY: 24}
	 * @return {Boolean}    
	 */
	ElementManager.prototype.includesMultipleLines = function(ys) {
		return ys.topY != ys.bottomY;
	};

	/**
	 * gets elements on a selection delimitied by an area, with some special cases
	 * @param  {Array} elems  array of elements; e.g. 'NoteSpaceView'
	 * @param  {Object} coords e.g. {x:23, y:34, xe: 153, ye: 45}
	 * @param  {Array} ini    Array of two numbers representing x and y ([x,y]), represents the initial position (where user clicked initially on selection), x is equal to coords.x or coords.xe, and y is equal to coords.y or coords.ye (yes, it's redundant data, and should be refactored)
	 * @param  {Array} end    Exactly the same as ini, but represents the end position (where user did mousup after dragging on selection),
	 * @param  {Object} ys    Has ys delimiting selection. e.g.:{bottomY: 12, topY: 24}
	 * @return {Array}        returns indexes including selected elements
	 */
	ElementManager.prototype.getElemsInPath = function(elems, coords, ini, end, ys) {


		var min = null,
			max = null;

		//special case of getElemsInPath: if we had selected from top right to bottom left, or from bottom left to top right, and elements selected
		//include more than one line: 
		//	we have to get elements  starting after top right, and finishing before bottom left.
		//otherwise, we do a normal 'getElemsInPath', maybe we should refactor this to not treat so many 'special cases' and 'ifs'
		if (ini && end && ys &&
			(this.fromLeftBottom2TopRight(ini, end) || this.fromTopRight2BottomLeft(ini, end)) && this.includesMultipleLines(ys)) {
			return this.getInvertedElemsInPath(elems, coords);
		} else {
			for (var i in elems) {
				if (elems[i].isInPath(coords)) {
					if (min == null) {
						min = Number(i);
					}
					if (max == null || max < i) {
						max = Number(i);
					}
				}
			}
			return (min === null && max === null) ? false : [min, max];
		}
	};

	/**
	 * instead of selecting elements specified by an area, gets for the very first line, and the last one, those not including getArea
	 * @param  {Array} elems  array of elements; e.g. 'NoteSpaceView'
	 * @param  {Object} coords e.g. {x:23, y:34, xe: 153, ye: 45}
	 * @return {[type]}        [description]
	 */
	ElementManager.prototype.getInvertedElemsInPath = function(elems, coords) {

		function getFirstAndLast(inPathElems) {

			var firstLastElement = null;
			if (inPathElems.length < 2) {
				//console.warn("inPathElems cannot be lower than 2");
				return false;
			}
			var i = 0;
			var elem;
			var smallestY = inPathElems[0].y;

			while (inPathElems[i].y === smallestY) {
				i++;
			}

			var indexFirstLine = inPathElems[i - 1].index;
			var hightestY = inPathElems[inPathElems.length - 1].y;

			i = inPathElems.length - 1;
			while (inPathElems[i].y === hightestY) {
				i--;
			}
			var indexLastLine = inPathElems[i + 1].index;
			return (indexFirstLine == null && indexLastLine == null) ? false : [indexFirstLine, indexLastLine];
		}

		var min = null,
			max = null;
		var inPathElems = [];
		for (var i in elems) {
			if (elems[i].isInPath(coords)) {
				inPathElems.push({
					index: Number(i),
					y: elems[i].position.y
				});
			}
		}
		return getFirstAndLast(inPathElems)
	};

	/**
	 * @param  {Array} elems array of elements; e.g. 'NoteSpaceView'
	 * @param  {Array} ys    [yMin, yMax]
	 * @return {Array} of two positions [min, max], or boolean false if nothing found
	 */
	ElementManager.prototype.getElemsBetweenYs = function(elems, ys) {
		var min = null,
			max = null;
		for (var i in elems) {
			if (elems[i].isBetweenYs(ys)) {
				if (min == null) {
					min = Number(i);
				}
				if (max == null || max < i) {
					max = Number(i);
				}
			}
		}
		return (min === null && max === null) ? false : [min, max];
	};

	/**
	 * function to determine how high elements are situated
	 * @param  {Array} elems  array of elements; e.g. 'NoteSpaceView'
	 * @param  {Object} coords
	 */
	ElementManager.prototype.getYs = function(elems, coords) {
		var cursor = this.getElemsBetweenYs(elems, [coords.y, coords.ye]);
		if (cursor) {
			return {
				topY: elems[cursor[0]].getArea().y,
				bottomY: elems[cursor[1]].getArea().y
			};
		} else {
			return false;
		}
	};

	/**
	 * @param  {Array} elems      [description]
	 * @param  {[Integer, Integer]} cursor     [description]
	 * @param  {Object} cursorDims
	 * @return {Array of Objects}    Object in this form: {area.x, area.y, area.xe, area.ye}
	 */
	ElementManager.prototype.getElementsAreaFromCursor = function(elems, cursor, cursorDims) {

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

		// to avoid bug when after making changes in melody new melody is shorter than cursor length
		if (cEnd >= elems.length) cEnd = elems.length - 1;

		while (cInit <= cEnd) {
			currElem = elems[cInit];
			if (typeof currElem.getArea !== 'function') {
				throw "ElementManager - Error: element passed has no getArea() function";
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
					h: cursorDims.height || currElem.getArea().h
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
	return ElementManager;
});