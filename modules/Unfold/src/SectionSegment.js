define(function(){
	var SectionSegment = function(structure, fromPoint, toPoint, playIndex) {
		var self = this;
		this.structure = structure;
		this.fromPoint = fromPoint;
		this.toPoint = toPoint;
		this.sectionIndex = fromPoint.section;
		this.playIndex = playIndex;
		this.getSection = function() {
			return self.structure.getSection(self.sectionIndex);		
		};
		this.bars = this.getSection().getPartPlayBarNumbers(playIndex, fromPoint.bar, toPoint.bar);
	};

	return SectionSegment;
});