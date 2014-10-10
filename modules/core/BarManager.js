define(function(){
	function BarManager(){
		this.bars = [];
	}

	BarManager.prototype.getTotal = function() {
		return this.bars.length;
	};

	BarManager.prototype.getBars = function() {
		return this.bars;
	};

	BarManager.prototype.getBar = function(index) 
	{
		if (typeof index === "undefined" || isNaN(index)){
			throw "invalid index "+index;
		}
		return this.bars[index];
	};
	/**
	 * @param {BarModel} bar 
	 */
	BarManager.prototype.addBar = function(bar) {
		this.bars.push(bar);
	};

	BarManager.prototype.removeBar = function(index) {
		this.bars.splice(index,1);
	};

	return BarManager;
});