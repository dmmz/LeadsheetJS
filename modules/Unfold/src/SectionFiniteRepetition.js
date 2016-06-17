define(['modules/Unfold/src/SectionRepetition'], function(SectionRepetition) {
	var SectionFiniteRepetition = Object.create(SectionRepetition);

	SectionFiniteRepetition.callInitValues = function(structure, section, playIndex) {
		this.initValues(structure, section, playIndex, playIndex + 1);
		this.playIndex = playIndex;
	};
	return SectionFiniteRepetition;
});