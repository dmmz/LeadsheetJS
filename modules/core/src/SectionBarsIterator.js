define(function() {
	function SectionBarsIterator (section) {
		this.section = section;
		this.index = 0;
	}
	SectionBarsIterator.prototype = {
		hasNext: function(){
			return this.index < this.section.getNumberOfBars() ;
		},
		next: function(){
			this.index++;
		}
	};

	return SectionBarsIterator;
});