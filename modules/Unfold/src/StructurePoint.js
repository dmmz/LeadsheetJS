define(['modules/Unfold/src/EndLabel'], function(EndLabel) {
	var StructurePoint = {
		/**
		 * @param {LeadsheetStructure} leadsheetStructure [description]
		 * @param {Label} label              
		 * @param {Number} section
		 * @param {Number} bar          
		 * @param {Number} playIndex
		 */
		setValues: function(leadsheetStructure, label, section, bar, playIndex) {
			this.leadsheetStructure = leadsheetStructure;
			this.label = label;
			this.section = section;
			this.bar = bar !== undefined ? bar : 0;
			this.playIndex = playIndex !== undefined ? playIndex : 0;
		},
		getLabel: function() {
			return this.label;
		},
		hasLabel: function(label) {
			return this.getLabel() === label;
		},
		getStructure: function() {
			return this.leadsheetStructure;
		},
		isAfter: function(otherPoint) {
			return this.compareTo(otherPoint) > 0;
		},
		isBefore: function(otherPoint) {
			return this.compareTo(otherPoint) < 0;
		},
		/**
		 * @param  {LeadsheetStructure}  structure 
		 * @param  {Integer}  section   number of section
		 * @return {Boolean}           [description]
		 */
		isInSection: function(structure, section) {
			return this.leadsheetStructure === structure && this.section === section;
		},
		compareTo: function(otherPoint) {
			if (this.getLabel() === EndLabel.END) {
				return 1;
			}
			if (otherPoint.getLabel() === EndLabel.END) {
				return -1;
			}

			if (this.section !== otherPoint.section) {
				return this.section < otherPoint.section ? -1 : 1;
			} else if (this.playIndex != otherPoint.playIndex) {
				return this.playIndex < otherPoint.playIndex ? -1 : 1;
			} else {
				return this.bar < otherPoint.bar ? -1 : 1;
			}
		}
	};
	return StructurePoint;
});