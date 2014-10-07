var BarManagerModel = function(){
	this.bars = [];
};
//Interface functions (this functions are also in NoteManagerModel and ChordManagerModel  )
//@interface
BarManagerModel.prototype.getTotal = function() {
	return this.bars.length;
};
/**
 * @interface
 * @param  {integer} start 
 * @param  {integer} end   
 * @return {Array}       
 */		
BarManagerModel.prototype.getBeatIntervalByIndexes = function(start, end) {
	//TODO
};
/**
 * @param  {Object}  area Object with porperties xi,xe,yi,ye
 * @return {Boolean} 
 */
BarManagerModel.prototype.findMinMaxBarsByCoords = function(coords, vBars) {
	function isInPath(bar,area)
	{
		var xe = bar.start_x + bar.width;
		var ye = bar.y + bar.height;
		return (area.xi < xe && area.xe > bar.x) && (area.yi < ye && area.ye > bar.y);
	}
	var min = null;
	var max = null;
	for (var i = 0; i < vBars.length; i++) {
		if (isInPath(vBars[i],coords)){
			min = (min > i || min === null) ? i : min;
			max = (max < i || max === null) ? i : max;
		}
	}
	return [min,max];
};



BarManagerModel.prototype.getBars = function() {
	return this.bars;
};

BarManagerModel.prototype.getBar = function(index) 
{
	if (typeof index !== "undefined" && !isNaN(index)) 
		return this.bars[index];
	else
		return undefined;
};
/**
 * @param {BarModel} bar 
 */
BarManagerModel.prototype.addBar = function(bar) {
	this.bars.push(bar);
};

BarManagerModel.prototype.removeBar = function(index) {
	this.bars.splice(index,1);
};