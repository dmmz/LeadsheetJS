define(function() {
	/**
	 * Abstraction class, used by NoteSpaceManager and ChordSpaceManager (by composition rather than heritage)
	 * @exports Edition/ElementManager
	 */
	function ElementManager() {}

	/*
	 * @param  {Array} ini Array of two numbers representing x and y ([x,y]), represents the initial position (where user clicked initially on selection)
	 * @param  {Array} end  Exactly the same as ini, but represents the end position (where user did mousup after dragging on selection),
	 * @return {Boolean}     
	 */
	ElementManager.prototype.fromLeftBottom2TopRight = function(ini, end) {
		return ini[0] < end[0] && ini[1] > end[1];
	};

	/*
	 * @param  {Array} ini Array of two numbers representing x and y ([x,y]), represents the initial position (where user clicked initially on selection)
	 * @param  {Array} end  Exactly the same as ini, but represents the end position (where user did mousup after dragging on selection),
	 * @return {Boolean}     
	 */
	ElementManager.prototype.fromTopRight2BottomLeft = function(ini, end) {
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
	 * like getElementsInPath but returns only one element, useful in for some classes like 'CommentSpaceManager'
	 * @param  {Array} elems   elems  array of elements; e.g. 'CommentSpaceManager'
	 * @param  {Object} coords e.g. {x:23, y:34, xe: 153, ye: 45}
	 * @return {[type]}        [description]
	 */
	ElementManager.prototype.getOneElemInPath = function(elems, coords) {
		for (var i in elems){
			if (elems[i].isInPath(coords)){
				return elems[i];
			}
		}
	};

	/**
	 * instead of selecting elements specified by an area, gets for the very first line, and the last one, those not including getArea
	 * @param  {Array} elems  array of elements; e.g. 'NoteSpaceView'
	 * @param  {Object} coords e.g. {x:23, y:34, xe: 153, ye: 45}
	 * @return {}        
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
		return getFirstAndLast(inPathElems);
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
	 * @param  {Array} cursor     [Integer, Integer]
	 * @return {Array}    Array of Objects in this form: {area.x, area.y, area.xe, area.ye}
	 */
	ElementManager.prototype.getElementsAreaFromCursor = function(elems, cursor) {

		var areas = [],
			area,
			cInit = cursor[0],
			cEnd = cursor[1];

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
				x = firstElemLine.getArea().x ;
				xe = lastElemLine.x - x + lastElemLine.w;
				area = {
					x: x,
					y: currElemY,
					w: xe,
					h: currElem.getArea().h
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
	/**
	 * merges two cursors, used on cumulated section (using mouse + ctrl), 
	 * We manage the case in which one of those cursors has position null, which arrives when the cursor was disabled, 
	 * but not the case where both are null, which should never array
	 * 
	 * @param  {Array} cursor1 [start, end]
	 * @param  {Array} cursor2 [start, end]
	 * @return {Array}         [start, end]
	 */
	ElementManager.prototype.getMergedCursors = function(cursor1, cursor2) {
		var mergedCursor = [];

		if (cursor1[0] == null && cursor1[1] == null){
			cursor1 = cursor2;
		}else if(cursor2[0] == null && cursor2[1] == null){
			cursor2 = cursor1;
		}
		mergedCursor[0] = cursor1[0] < cursor2[0] ? cursor1[0] : cursor2[0];
		mergedCursor[1] = cursor1[1] > cursor2[1] ? cursor1[1] : cursor2[1];
		return mergedCursor;
	};

	return ElementManager;
});