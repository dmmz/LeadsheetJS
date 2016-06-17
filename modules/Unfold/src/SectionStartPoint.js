define(['modules/Unfold/src/StartPoint'], function(StartPoint){
	var SectionStartPoint = Object.create(StartPoint);

	SectionStartPoint.callInitValues = function(leadsheetStructure, section){
		var label = {};
		label['start_section_'+section] = section;

		this.initValues(leadsheetStructure, label, section, 1);
		return this;
	};

	return SectionStartPoint;

});