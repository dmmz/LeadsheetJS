define(['modules/core/src/BarModel'], function(BarModel) {
	/**
    * A module representing a list of bars
    * @exports core/BarManager
    */
	function BarManager() {
		this.bars = [];
	}

	BarManager.prototype.getTotal = function() {
		return this.bars.length;
	};

	BarManager.prototype.getBars = function() {
		return this.bars;
	};
	BarManager.prototype.setBars = function(bars) {
		this.bars = bars;
	};
	
	/**
	 * Retrieve bar defined by index
	 * @param  {Integer} index 
	 */
	BarManager.prototype.getBar = function(index) {
		if (isNaN(index) || index < 0) {
			throw "BarManager - getBar - invalid index :" + index;
		}
		return this.bars[index];
	};

	/**
	 * @param {BarModel} bar
	 */
	BarManager.prototype.addBar = function(bar) {
		if (typeof bar === "undefined" || !(bar instanceof BarModel)) {
			bar = new BarModel();
		}
		this.bars.push(bar);
		return bar;
	};

	/**
	 * 
	 * @param  {BarModel} bar   
	 * @param  {Integer} index 
	 */
	BarManager.prototype.insertBar = function(indexBar, song, numBars) {
		if (indexBar === undefined || !song) {
			throw "BarManager - insertBar - missing params";
		}
		numBars = numBars || 1;
		var barsToInsert = [];
		for (var i = 0; i < numBars; i++) {
			this.bars.splice(indexBar + 1, 0, new BarModel());
		}
		if (indexBar > 0) {
			indexBar--; // we need to get previous bar, otherwise section doesn't know yet the new number of bars
		}
		var section = song.getSection(song.getSectionNumberFromBarNumber(indexBar));
		section.setNumberOfBars(section.getNumberOfBars() + numBars);
	};


	BarManager.prototype.removeBar = function(index) {
		if (typeof index === "undefined" || isNaN(index) || index < 0) {
			throw "BarManager - removeBar - invalid index " + index;
		}
		this.bars.splice(index, 1);
	};
	BarManager.prototype.clear = function() {
		this.bars = [];
	};

	return BarManager;
});