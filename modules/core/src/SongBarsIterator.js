define(function() {
	function SongBarsIterator (song) {
		this.song = song;
		this.index = 0;
		this.bm = this.song.getComponent('bars');

		this.prevTimeSig = null;
		this.prevKeySig = null;
		this.endingState = null;
	}
	SongBarsIterator.prototype = {
		hasNext: function(){
			return this.index < this.bm.getTotal();
		},
		next: function(){
			var bar = this.bm.getBar(this.index);
			this.prevKeySig = this.getBarKeySignature();
			this.prevTimeSig = this.getBarTimeSignature();
			this.index++;
		},
		getBarIndex: function(){
			return this.index;
		},
		getBar: function(){
			return this.bm.getBar(this.index);
		},
		getFollowingBar: function(){
			return this.bm.getBar(this.index+1);
		},
		getBarKeySignature: function(){
			var keySig = this.getBar().getTonality();
			if (keySig) {
				return keySig;
			}
			else {
				return (this.index === 0) ? this.song.getTonality() : this.prevKeySig;
			}
		},
		getBarTimeSignature: function(){
			var timeSig = this.getBar().getTimeSignature();
			if (timeSig) {
				return timeSig;
			}
			else {
				return (this.index === 0) ? this.song.getTimeSignature() : this.prevTimeSig;
			}
			//return this.getBar().getTimeSignature() || (this.index == 0) ? this.song.getTimeSignature() : this.prevTimeSig;
		},
		getEndingState: function(){
			return this.endingState;
		},
		setEndingState: function(endingState){
			this.endingState = endingState;
		}

	};
	return SongBarsIterator;
});