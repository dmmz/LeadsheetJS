define([
	'pubsub',
], function(pubsub) {

	/**
	 * Cursor consists of a pos array that contain index start and index end of position
	 * @param {Array} optCursor gets a cursor as an array of two positions [start,end]
	 * @param {string} color, color in hexadecimal indicates how to draw cursor
	 */
	function CursorModel(optCursor, color) {
		optCursor = optCursor || [0, 0];
		if (!(optCursor instanceof Array)) optCursor = [optCursor, optCursor];

		this.sideSelected = 1;
		this.setPos(optCursor);
		this.color = color || "#0099FF";
	}


	CursorModel.prototype.getPos = function() {
		return this.pos;
	};

	/**
	 * @param {Array} gives the position of the note of the cursor pos can be an array [start,end]
	 * or a single value that will be converted to an array [value, value]
	 */
	CursorModel.prototype.setPos = function(pos) {
		if (!(pos instanceof Array)) pos = [pos, pos];
		this.pos = pos;
		$.publish('CursorModel-setPos', this.pos);
	};

	CursorModel.prototype.getStart = function() {
		return this.pos[0];
	};

	CursorModel.prototype.getEnd = function() {
		return this.pos[1];
	};

	/**
	 * Set only one element of the position eg setIndexPos(0, 3), setIndexPos(1, 4)
	 * @param {int} index must be 0 or 1, 0 mean you want to change start, 1 mean you want to change end
	 * @param {int} pos   cursor position
	 */
	CursorModel.prototype.setIndexPos = function(index, pos) {
		if ((index != 0 && index != 1) || isNaN(pos)) {
			throw 'CursorModel - setIndexPos, arguments not well defined ' + 'index:' + index + ' - pos:' + pos;
		}
		this.pos[index] = pos;
		$.publish('CursorModel-setPos', this.pos);
	};


	/**
	 * normally after deleting, if cursor points to an unexisting note, it moves to the last one existing
	 * @param  {int} numNotes number of notes that exist
	 */
	CursorModel.prototype.revisePos = function(numNotes) {
		for (var i in this.pos) {
			if (this.pos[i] >= numNotes) this.setIndexPos(i, numNotes - 1);
		}
	};

	/**
	 * expands (= moves just one side of the cursor)
	 * @param  {int} inc      -1 or 1, expand to left or right
	 * @param  {int} numNotes number of maximum position of cursor
	 */
	CursorModel.prototype.expand = function(inc, numNotes) {
		if (this.pos[1] === this.pos[0]) {
			this.sideSelected = (inc > 0) ? 1 : 0;
		}
		var newPos = this.pos[this.sideSelected] + inc;
		if (newPos >= 0 && newPos < numNotes) {
			this.setIndexPos(this.sideSelected, newPos);
		}
	};

	CursorModel.prototype.getRelativeCursor = function(index) {
		var newSelected = [this.pos[0] - index, this.pos[1] - index];
		return new CursorModel(newSelected);
	};

	CursorModel.prototype.reset = function() {
		this.setPos([0, 0]);
	};

	CursorModel.prototype.increment = function(inc) {
		inc = inc || 1;
		this.setIndexPos(0, this.pos[0] += inc);
		this.setIndexPos(1, this.pos[1] += inc);
	};

	return CursorModel;
});