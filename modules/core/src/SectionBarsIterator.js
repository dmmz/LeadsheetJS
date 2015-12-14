define(function() {
	/**
     * Iterator that allow to go through sections
     * @exports core/SectionBarsIterator
	 */
	function SectionBarsIterator (section) {
		this.section = section;
		this.index = 0;
	}
	SectionBarsIterator.prototype = {
		hasNext: function(){
			return this.index < this.section.getNumberOfBars();
		},
		getBarIndex: function(){
			return this.index;
		},
		getSection: function(){
			return this.section;
		},
		next: function(){
			this.index++;
		},
		isLastBar: function(){
			return this.index == this.section.getNumberOfBars()-1;
		}
	};

	return SectionBarsIterator;
});