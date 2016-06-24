define(['modules/Unfold/src/SectionRepetition'], function(SectionRepetition) {
	var SectionOpenRepetition = Object.create(SectionRepetition);

	SectionOpenRepetition.callInitValues = function(structure, section) {
		this.initValues(structure, section, 0, 0);
	};
	return SectionOpenRepetition;
});