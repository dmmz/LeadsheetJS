define(['modules/core/src/BarModel'], function(BarModel) {
	function BarManager() {
		this.bars = [];
	}

	BarManager.prototype.getTotal = function() {
		return this.bars.length;
	};

	BarManager.prototype.getBars = function() {
		return this.bars;
	};


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

	BarManager.prototype.removeBar = function(index) {
		if (typeof index === "undefined" || isNaN(index) || index < 0) {
			throw "BarManager - removeBar - invalid index " + index;
		}
		this.bars.splice(index, 1);
	};
	return BarManager;
});