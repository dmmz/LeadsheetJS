define(function(){
	var StructurePoint = {
		setValues: function(leadsheetStructure, label, section, bar, playIndex){
			this.leadsheetStructure = leadsheetStructure;
			this.label = label;
			this.section = section;
			this.bar = bar !== undefined ? bar : 1;
			this.playIndex = playIndex !== undefined ? playIndex : 0;
		},
		// create: function(){
		// 	return Object.create(this);
		// },
		getLabel: function(){
			return this.label;
		}
	};
	return StructurePoint;
});