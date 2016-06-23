define(function(){
	var SectionSegment = function(structure, fromPoint, toPoint, playIndex) {
		this.structure = structure;
		this.fromPoint = fromPoint;
		this.toPoint = toPoint;
		this.sectionIndex = fromPoint.sectionIndex;
		this.playIndex = playIndex;
		this.bars = this.getSection().getPartPlayNumbers(playIndex, fromPoint.bar, toPoint.bar);
	};
	SectionSegment.getSection = function() {
		return this.structure.getSection(this.sectionIndex);
	};

	SectionSegment.toUnfoldedSection = function() {
		
	};
});