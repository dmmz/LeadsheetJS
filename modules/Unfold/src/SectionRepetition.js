define([
	'modules/Unfold/src/Repetition'
], function(Repetition) {
	var SectionRepetition = Object.create(Repetition);

	SectionRepetition.initValues = function(structure, section, playIndexFrom, playIndexTo) {
		this.setValues(
			structure.getSectionEndPoint(section, playIndexFrom),
			structure.getSectionStartPoint(section)
		);
		this.section = section;
	};
	return SectionRepetition;
});