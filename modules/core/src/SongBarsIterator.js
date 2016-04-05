define([
	'modules/core/src/TimeSignatureModel',
	'modules/core/src/SongBarChange'
], function(TimeSignatureModel, SongBarChange) {
	/**
	 * Iterator that allow to go through bars
	 * @exports core/SongBarsIterator
	 */

	function SongBarsIterator(song) {
		this.song = song;
		this.bm = this.song.getComponent('bars')
		this.timeSigMng = new SongBarChange(this, 'getTimeSignatureChange', 'getTimeSignature', TimeSignatureModel);
		this.keySigMng = new SongBarChange(this, 'getKeySignatureChange', 'getTonality');
		this.reset();
	};
	SongBarsIterator.prototype = {
		_getTimeSignatureChange: function() {
			return
			// var barSigChange = this.getBar().getTimeSignatureChange();
			// if (barSigChange){
			// 	return barSigChange;
			// }else{
			// 	var sectionTimeSig;
			//  	//if we are at a new section, we add a time signature change
			// 	if (this.isFirstSectionBar){
			// 		sectionTimeSig = this.song.getSection(this.iSection).getTimeSignature();
			// 		return sectionTimeSig ? new TimeSignatureModel(sectionTimeSig) : null;
			// 	}
			// }
		},

		reset: function() {
			this.index = 0;
			this.iSection = 0;
			this.iSectionNumbars = 0; // sum of bars in previous sections
			this.isFirstSectionBar = true;
			this.timeSigMng.reset();
			this.keySigMng.reset();
			this.endingState = null;
			this.ending = null;
			this.beats = 1;
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

			var keySig = this.getBarKeySignature();
			var timeSig = this.getBarTimeSignature();

			this.timeSigMng.setPrevValue(timeSig);
			this.keySigMng.setPrevValue(keySig);

			this.beats += timeSig.getQuarterBeats();
			// section
			var sectionNumBars = this.song.getSection(this.iSection).getNumberOfBars();
			if (this.index === this.iSectionNumbars + sectionNumBars - 1) {
				this.iSectionNumbars += sectionNumBars;
				this.iSection++;
				this.isFirstSectionBar = true;
			} else {
				this.isFirstSectionBar = false;
			}
			var ending = this.getEnding(this.isFirstSectionBar);;
			this.prevEnding = ending;
			//we calculate always timeSig before endings, except if it is ending 1, because we will retrieve it after ending one
			if (ending != 1) {
				this.timeSigMng.setBeforeEndingValue(timeSig);
				this.keySigMng.setBeforeEndingValue(keySig);
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
		getPrevKeySignature: function() {
			return this.keySigMng.getPrevValue();
		},
		getPrevTimeSignature: function() {
			return this.timeSigMng.getPrevValue();
		},
		getBarKeySignature: function() {
			return this.keySigMng.getBarElemValue();
		},
		getBarTimeSignature: function() {
			return this.timeSigMng.getBarElemValue();
		},
		doesTimeSignatureChange: function() {
			var timeSig = this.timeSigMng.getBarChange();
			return (!!timeSig && timeSig != this.timeSigMng.getPrevValue());
		},
		getStartEndBeats: function() {
			return [this.beats, this.beats + this.getBarTimeSignature().getQuarterBeats()];
		},
		getEnding: function(isFirstSectionBar) {
			if (isFirstSectionBar) {
				return this.getBar().getEnding();
			} else {
				return this.getBar().getEnding() || this.prevEnding;
			}
		},
		/**
		 * getEndingState and setEndingState are functions used when drawing the ending boxes. The values can be 'BEGIN', 'MID', 'BEGIN_END', 'END'
		 */
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