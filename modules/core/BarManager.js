define(function(){
	function BarManagerModel(){
		this.bars = [];
	}

	BarManagerModel.prototype.getTotal = function() {
		return this.bars.length;
	};

	BarManagerModel.prototype.getBars = function() {
		return this.bars;
	};

	BarManagerModel.prototype.getBar = function(index) 
	{
		if (typeof index === "undefined" || isNaN(index)){
			throw "invalid index "+index;
		}
		return this.bars[index];
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
});