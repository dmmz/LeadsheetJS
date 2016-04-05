define(function() {
	/**
	 * This class abstracts the logic to treat changes on time signature and key signature in a leadsheet. It is used only by SongBarsIterator.
	 * 'Elem' part in properties name refers to the actual element which can be either time signature or key signature
	 * @param {SongBarsIterator} barsIt            
	 * @param {String} getBarChangeFn    represents a method of BarModel to call.  Possible values "getTimeSignatureChange" or "getKeySignatureChange"
	 * @param {String} getElementValueFn represents a method of SongModel or SectionMdoel. Possible values "getTimeSignature" or "getTonality"
	 * @param {Object} constructor             element constructor if needed. Is the case of time signature
	 */
	function SongBarsChange(barsIt, getBarChangeFn, getElementValueFn, constructor) {
		this.getBarChangeFn = getBarChangeFn;
		this.getElementValueFn = getElementValueFn;
		this.barsIt = barsIt;
		this.beforeEnding = null;
		this.constructor = constructor;
		this.prevElemValue = null;
	};
	SongBarsChange.prototype = {

		reset: function() {
			this.beforeEnding = null;
			this.prevElemValue = null;
		},
		setPrevValue: function(val) {
			this.prevElemValue = val;
		},
		getPrevValue: function() {
			return this.prevElemValue;
		},
		setBeforeEndingValue: function(val) {
			this.beforeEnding = val;
		},
		getBeforeEndingValue: function() {
			return this.beforeEnding;
		},
		getBarChange: function() {
			var barChange = this.barsIt.getBar()[this.getBarChangeFn]();
			if (barChange) {
				return barChange;
			} else {
				var sectionChange;
				//if we are at a new section, we add a time signature change
				if (this.barsIt.isFirstSectionBar) {
					var section = this.barsIt.song.getSection(this.barsIt.iSection);
					var sectionChange = section[this.getElementValueFn] ? section[this.getElementValueFn]() : null; //if function does not exists, returns null (it's the case of getTonality)
					return sectionChange ?
						this.constructor ? new this.constructor(sectionChange) : sectionChange //time signature needs a constructor where key signature is just a string
						: null;
				}
			}
		},
		getBarElemValue: function() {

			var elemValue = this.getBarChange();
			if (elemValue) {
				return elemValue;
			} else if (this.barsIt.prevEnding == 1 && this.barsIt.getEnding(this.barsIt.isFirstSectionBar) == 2) { // is important to use == instead of === as we are comparing sometimes string to numbers
				// when we are in the bar just after ending 1, we return bar time signature we had before ending 1, 
				//so that signature changes to ending 1 are not anymore taken into account
				return this.beforeEnding;
			} else {
				//case we are in first bar
				return (this.barsIt.index === 0) ? this.barsIt.song[this.getElementValueFn]() : this.prevElemValue;
			}

		}
	};
	return SongBarsChange;
});