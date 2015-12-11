define(['modules/core/src/SongBarsIterator'],
	function(SongBarsIterator) {
	/**
	 * We save the time in which each bar finishes
	 * @exports Wave/BarTimesManager
	 */
	function BarTimesManager() {
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
		getBarIndexByTime: function(time, barIndex){
			barIndex = barIndex || 0;
			while (barIndex < this.barTimes.length && this.barTimes[barIndex] < time) {
				barIndex++;
			}
			return barIndex; //to inform the value of index after being updated
		},
		getTimeLimits: function(index){
			if (index === undefined) throw "BarTimesManager - error: index not defined";
			return {
				start: (index === 0) ? 0 : this.barTimes[index - 1],
				end: this.barTimes[index]
			};
		},
		getCurrBarTime: function(index){
			var limits = this.getTimeLimits(index);
			return limits.end - limits.start;
		}
	};

	return BarTimesManager;
});