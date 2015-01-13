define(function() {
	function SongBarsIterator (song) {
		this.song = song;
		this.index = 0;

		this.prevTimeSig = null;
		this.prevKeySig = null;
		this.endingState = null;
	}
	SongBarsIterator.prototype = {
		hasNext: function(){
			return this.index < this.song.getComponent('bars').getTotal();
		},
		next: function(){
			var bar = this.song.getBar(this.index);
			this.prevKeySig = this.getBarKeySignature();
			this.prevTimeSig = bar.getTimeSignature();
			this.index++;
		},
		getBarIndex: function(){
			return this.index;
		},
		getBar: function(){
			return this.song.getBar(this.index);
		},
		getFollowingBar: function(){
			return this.song.getBar(this.index+1);
		},
		getBarKeySignature: function(){		
			return this.getBar().getTonality() || (this.index == 0) ? this.song.getTonality() : this.prevKeySig;  
		},
		getBarTimeSignature: function(){		
			return this.getBar().getTimeSignature() || (this.index == 0) ? this.song.getTimeSignature() : this.prevTimeSig;  
		},
		getEndingState: function(){
			return this.endingState;
		},
		setEndingState: function(endingState){
			return this.endingState = endingState;
		}

	}
	return SongBarsIterator;
});