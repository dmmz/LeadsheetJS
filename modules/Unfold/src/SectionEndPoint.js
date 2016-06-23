define(['modules/Unfold/src/EndPoint'], function(EndPoint){
	var SectionEndPoint = Object.create(EndPoint);

	SectionEndPoint.callInitValues = function(leadsheetStructure, section, playIndex){
		var label = {};
		label['end_section_' + section] = section;
		this.initValues(leadsheetStructure, label, section, leadsheetStructure.sections[section].getPlayEndBar(playIndex), playIndex);
	};
	SectionEndPoint.getJumpTo = function() {
		return this.leadsheetStructure.getSectionStartPoint(this.section + 1);
	};
	return SectionEndPoint;

});