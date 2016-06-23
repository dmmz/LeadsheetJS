define(['modules/Unfold/src/EndLabel'], function(EndLabel) {
	var StructurePoint = {
		setValues: function(leadsheetStructure, label, section, bar, playIndex) {
			this.leadsheetStructure = leadsheetStructure;
			this.label = label;
			this.section = section;
			this.bar = bar !== undefined ? bar : 1;
			this.playIndex = playIndex !== undefined ? playIndex : 0;
		},
		// create: function(){
		// 	return Object.create(this);
		// },
		getLabel: function() {
			return this.label;
		},
		getStructure: function() {
			return this.leadsheetStructure;
		},
		isAfter: function(otherPoint) {
			//TODO:
			//	if (!isPositionComplete() || !other.isPositionComplete())
			//		return false;
			return this.compareTo(otherPoint) > 0;
		},
		isBefore: function(otherPoint) {
			return this.compareTo(otherPoint) < 0;	
		},
		compareTo: function(otherPoint) {
			if (this.getLabel() === EndLabel.END ) {
				return 1;
			}
			if (otherPoint.getLabel() === EndLabel.END) {
				return -1;
			}
						
			if (this.section !== otherPoint.section){
				return this.section < otherPoint.section ? -1 : 1;
			}else if (this.playIndex != otherPoint.playIndex){
				return this.playIndex < otherPoint.playIndex ? -1 : 1;
			}else{
				return this.bar < otherPoint.bar ? -1 : 1;
			}
		}
	};
	return StructurePoint;
});