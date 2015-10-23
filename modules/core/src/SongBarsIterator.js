define(function() {
	/**
	 * @param {SongModel}
	 */
	function SongBarsIterator (song) {
		this.song = song;
		this.bm = this.song.getComponent('bars');
		this.reset();
	}
	SongBarsIterator.prototype = {
		reset: function(){
			this.index = 0;
			this.prevTimeSig = null;
			this.prevKeySig = null;
			this.endingState = null;	
		},
		hasNext: function(){
			return this.index < this.bm.getTotal();
		},
		next: function(){
			var bar = this.bm.getBar(this.index);
			this.prevKeySig = this.getBarKeySignature();
			this.prevTimeSig = this.getBarTimeSignature();
			this.index++;
			return this.hasNext();
		},
		setBarIndex: function(index){
			if (index < this.index){
				throw "index is " + this.index + ", cannot go backwards to " + index;
			}
			while (this.index != index){
				this.next();
			}
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
		doesTimeSignatureChange: function(){
			var timeSig = this.getBar().getTimeSignatureChange();
			return (timeSig && timeSig != this.prevTimeSig);
		},
		getBarTimeSignature: function(){
			var timeSig = this.getBar().getTimeSignatureChange();
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
		},
		isLast: function(){
			return this.index == this.bm.getTotal() - 1;
		}

	};
	return SongBarsIterator;
});