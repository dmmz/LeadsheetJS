define(['modules/core/src/TimeSignatureModel'],function(TimeSignatureModel) {
	/**
	 * @param {SongModel}
	 */
	function SongBarsIterator(song) {
		this.song = song;
		this.bm = this.song.getComponent('bars');
		this.reset();
	}
	SongBarsIterator.prototype = {
		_getTimeSignatureChange: function() {
			if (this.isFirstSectionBar) {
				var sectionTimeSig = this.song.getSection(this.iSection).getTimeSignature()
				if (sectionTimeSig){
					return new TimeSignatureModel(sectionTimeSig);	
				} 
			} else {
				return this.getBar().getTimeSignatureChange();
			}
		},

		reset: function() {
			this.index = 0;
			this.iSection = 0;
			this.iSectionNumbars = 0; // sum of bars in previous sections
			this.isFirstSectionBar = true;
			this.prevTimeSig = null;
			this.prevKeySig = null;
			this.endingState = null;
		},
		/**
		 *	if true, it means we are at the last iteration, should be used like this
		 *	while(songBarsIt.hasNext())
		 *	{
		 *		//here goes all the logic to do on current bar
		 *		songBarsIt.next();
		 *	}
		 *
		 *	(apparently all iterators work the other around, first 'next()', then logic, TODO: change)
		 * 
		 * @return {Boolean}
		 */
		hasNext: function() {
			return this.index < this.bm.getTotal();
		},

		/**
		 *	steps forward, returns if it hasNext after making the step, this way we can check if we can move one step forward.
		 *	Useful if we want to get information about next iteration on a loop
		 *
		 * while( loop ){
		 * 		//logic
		 * 
		 * 	if (songBarIt.next()){
		 *		//get info about next bar
		 *	}
		 * 
		 * }
		 *	
		 * 
		 * @return {Boolean}
		 */
		next: function() {

			this.prevKeySig = this.getBarKeySignature();
			this.prevTimeSig = this.getBarTimeSignature();

			// section
			var sectionNumBars = this.song.getSection(this.iSection).getNumberOfBars();
			if (this.index === this.iSectionNumbars + sectionNumBars - 1) {
				this.iSectionNumbars += sectionNumBars;
				this.iSection++;
				this.isFirstSectionBar = true;
			} else {
				this.isFirstSectionBar = false;
			}

			this.index++;
			return this.hasNext();
		},
		setBarIndex: function(index) {
			if (index < this.index) {
				throw "index is " + this.index + ", cannot go backwards to " + index;
			}
			while (this.index != index) {
				this.next();
			}
		},
		getBarIndex: function() {
			return this.index;
		},
		getBar: function() {
			return this.bm.getBar(this.index);
		},
		getFollowingBar: function() {
			return this.bm.getBar(this.index + 1);
		},
		getBarKeySignature: function() {
			var keySig = this.getBar().getKeySignatureChange();
			if (keySig) {
				return keySig;
			} else {
				return (this.index === 0) ? this.song.getTonality() : this.prevKeySig;
			}
		},
		doesTimeSignatureChange: function() {
			var timeSig = this._getTimeSignatureChange();
			return (!!timeSig && timeSig != this.prevTimeSig);
		},
		getBarTimeSignature: function() {
			var timeSig = this._getTimeSignatureChange();
			if (timeSig) {
				return timeSig;
			} else {
				return (this.index === 0) ? this.song.getTimeSignature() : this.prevTimeSig;
			}
			//return this.getBar().getTimeSignature() || (this.index == 0) ? this.song.getTimeSignature() : this.prevTimeSig;
		},
		getEndingState: function() {
			return this.endingState;
		},
		setEndingState: function(endingState) {
			this.endingState = endingState;
		},
		isLast: function() {
			return this.index == this.bm.getTotal() - 1;
		}

	};
	return SongBarsIterator;
});