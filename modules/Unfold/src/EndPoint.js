define(['modules/Unfold/src/StructurePoint'], function(StructurePoint){
	var EndPoint = Object.create(StructurePoint);

	/*EndPoint.create = function(){
		var a = Object.create(this);
		a.init(leadsheetStructure, label, bar, section, playIndex);
		leadsheetStructure.addStartLabel(this);
		return a;
	};*/
	//TODO: missign create function that decides to create either ToCodaPoint or EndPoint ??
	//
	EndPoint.initValues = function(leadsheetStructure, label, section, bar, playIndex)
	{
		this.setValues(leadsheetStructure, label, section, bar, playIndex);
		leadsheetStructure.addEndLabel(this);
	};

});
