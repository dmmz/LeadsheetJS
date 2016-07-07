define(['modules/Unfold/src/SectionRepetition'], function(SectionRepetition) {
	var SectionOpenRepetition = Object.create(SectionRepetition);	
	this.isSectionOpenRepetition = true; //we add an property to avoid the use of 'instanceof SectionOpenRepetition' which causes circular dependencies

	SectionOpenRepetition.callInitValues = function(structure, section) {
		this.initValues(structure, section, 0, 0);
	};
	SectionOpenRepetition.maxPlayReached = function(cursor) {
		return cursor.playIndex >= this.getConfig().numOpenPlays;
	};
	return SectionOpenRepetition;
});