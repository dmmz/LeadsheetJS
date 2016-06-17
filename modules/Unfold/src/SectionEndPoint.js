define(['modules/Unfold/src/EndPoint'], function(EndPoint){
	var SectionEndPoint = Object.create(EndPoint);

	SectionEndPoint.callInitValues = function(leadsheetStructure, section, playIndex){
		var label = {};
		label['end_section_'+section] = section;

		this.initValues(leadsheetStructure, label,this.sections[section].getPlayEndBar(playIndex), playIndex);
		return this;
	};

	return SectionEndPoint;

});