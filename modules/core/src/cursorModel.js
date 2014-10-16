	/**
 *	Cursor consists of a
 *		pos : the position that is an array of  the maximum and minimum
 * @param {Array} optCursor gets a cursor as an array of two positions [start,end]
 */
CursorModel = function(optCursor,color) {
	optCursor = optCursor || [0, 0];
	
	if (!(optCursor instanceof Array)) optCursor = [optCursor, optCursor];

	this.sideSelected = 1;
	this.pos = optCursor;
	this.color =  color || "#0099FF";

};

CursorModel.prototype.getStart = function() {
	return this.pos[0];
};
CursorModel.prototype.getEnd = function() {
	return this.pos[1];
};

/**
 *
 * @param {Array} gives the position of the note of the cursor pos can be an array [start,end]
 * or a single value that will be converted to an array [value, value]
 */
CursorModel.prototype.setPos = function(pos) {
	if (!(pos instanceof Array)) pos = [pos, pos];
	this.pos = pos;
};

/**
 * normally after deleting, if cursor points to an unexisting note, it moves to the last one existing
 * @param  {int} numNotes number of notes that exist
 */
CursorModel.prototype.revisePos = function(numNotes) {
	for (var i in this.pos) {
		if (this.pos[i] >= numNotes) this.pos[i] = numNotes - 1;
	}
};

CursorModel.prototype.getPos = function() {
	return this.pos;
};

/**
 * expands (= moves just one side of the cursor)
 * @param  {int} inc      -1 or 1, expand to left or right
 * @param  {int} numNotes number of maximum position of cursos
 */
CursorModel.prototype.expand = function(inc, numNotes) {

	if (this.pos[1] == this.pos[0]) {
		this.sideSelected = (inc > 0) ? 1 : 0;
	}
	var newPos = this.pos[this.sideSelected] + inc;
	if (newPos >= 0 && newPos < numNotes) {
		this.pos[this.sideSelected] = newPos;
	}
};

CursorModel.prototype.getRelativeCursor = function(index) {
	var newSelected = [this.pos[0] - index, this.pos[1] - index];
	return new CursorModel(newSelected);
};

CursorModel.prototype.reset = function() {
	this.pos = [0,0];
};

CursorModel.prototype.increment = function(inc) {
	inc = inc || 1;
	this.pos[0] += inc;
	this.pos[1] += inc;
};