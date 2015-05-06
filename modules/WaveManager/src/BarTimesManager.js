define(function() {
	function BarTimesManager() {
		this.index = 0;
		this.barTimes = [];
	}

	BarTimesManager.prototype = {
		setBarTimes: function(barTimes){
			this.barTimes = barTimes;
		},
		getLength: function(){
			return this.barTimes.length;
		},
		updateCurrBarByTime: function(time, index){
			while (this.index < this.barTimes.length && this.barTimes[this.index] < time) {
				this.index++;
			}
		},
		/*getCurrentTimeLimits: function(){
			return this.getTimeLimits(this.index);
		},*/
		getTimeLimits: function(index){
			if (typeof index === "undefined") throw "BarTimesManager - error: index not defined";
			return {
				start: (index === 0) ? 0 : this.barTimes[index - 1],
				end: this.barTimes[index]
			};
		},
		getIndexByTime: function(time){
			for (var i = 0; i < this.barTimes.length; i++) {
				if (time < this.barTimes[i]) break;
			}
			return i;
		}
	};

	return BarTimesManager;
});