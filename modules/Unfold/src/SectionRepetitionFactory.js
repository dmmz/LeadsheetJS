define([
		'modules/Unfold/src/SectionFiniteRepetition',
		'modules/Unfold/src/SectionOpenRepetition'
	],
	/**
	 * This class exists because we are translating from java and the original code had circular dependencies which imply problems with requirejs
	 * @param  {[type]} SectionRepetition       [description]
	 * @param  {[type]} SectionFiniteRepetition [description]
	 * @param  {[type]} SectionOpenRepetition   [description]
	 * @return {[type]}                         [description]
	 */
	function(SectionFiniteRepetition, SectionOpenRepetition) {
		var SectionRepetitionFactory = {
			get: function(structure, section, playIndex) {
				if (structure.getSection(section).hasOpenRepeats()) {
					var sectionOpenRep = Object.create(SectionOpenRepetition);
					sectionOpenRep.callInitValues(structure, section);
					return sectionOpenRep;
				} else {
					var sectionFiniteRep = Object.create(SectionFiniteRepetition);
					sectionFiniteRep.callInitValues(structure, section, playIndex);
					return sectionFiniteRep;
				}
			}
		};
		return SectionRepetitionFactory;
	});