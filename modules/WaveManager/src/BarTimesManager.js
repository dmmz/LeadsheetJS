define(['modules/core/src/SongBarsIterator'],
	function(SongBarsIterator) {
	/**
	 * We save the time in which each bar finishes
	 */
	function BarTimesManager() {
		this.index = 0;
		this.barTimes = [];
	}

	BarTimesManager.prototype = {
		
		setBarTimes: function(song, audio){
			
			function calculateBarTimes(song,audio) {
				var numBars = song.getComponent("bars").getTotal(),
				songIt = new SongBarsIterator(song),
				barTime = 0,
				barTimes = [];

				while (songIt.hasNext()) {
					barTime += songIt.getBarTimeSignature().getBeats() * audio.beatDuration;
					barTimes.push(barTime);
					songIt.next();
				}
				
				if (barTime < audio.getDuration()){
					barTimes.push(audio.getDuration());
				}
				return barTimes;
			}
			this.barTimes = calculateBarTimes(song,audio);
		},
		getLength: function(){
			return this.barTimes.length;
		},
		updateCurrBarByTime: function(time, index){
			while (this.index < this.barTimes.length && this.barTimes[this.index] < time) {
				this.index++;
			}
		},
		getTimeLimits: function(index){
			if (typeof index === "undefined") throw "BarTimesManager - error: index not defined";
			return {
				start: (index === 0) ? 0 : this.barTimes[index - 1],
				end: this.barTimes[index]
			};
		},
		getCurrBarTime: function(index){
			var limits = this.getTimeLimits(index);
			return limits.end - limits.start;
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