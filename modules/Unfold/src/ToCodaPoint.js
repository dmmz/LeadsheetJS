define(['modules/Unfold/src/EndPoint'], function(EndPoint) {
	var ToCodaPoint = Object.create(EndPoint);
	ToCodaPoint.callInitValues = function(leadsheetStructure, label, section, bar, playIndex) {
		this.initValues(leadsheetStructure, label, section, bar, playIndex);
	};
	ToCodaPoint.getJumpTo = function() {
		return this.leadsheetStructure.getStartLabel(this.label.getCodaToLabel());
	};
});