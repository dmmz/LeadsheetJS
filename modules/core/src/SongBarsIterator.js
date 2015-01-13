define(function() {
	function SongBarsIterator (song) {
		this.song = song;
		this.index = 0;

		this.prevTimeSig = null;
		this.prevKeySig = null;
	}
	SongBarsIterator.prototype = {
		hasNext: function(){
			return this.index < this.song.getComponent('bars').getTotal();
		},
		next: function(){
			var bar = this.song.getBar(this.index);
			this.prevKeySig = this.getBarTonality();
			this.prevTimeSig = bar.getTimeSignature();
			this.index++;
		},
		getBarIndex: function(){
			return this.index;
		},
		getBar: function(){
			return this.song.getBar(this.index);
		},
		getBarTonality: function(){
			return this.getBar().getTonality() || this.song.getTonality();
		}

	}
	return SongBarsIterator;
});