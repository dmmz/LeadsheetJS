define(function(){
	var LeadsheetUnfoldConfig = {
		init: function(leadsheetStructure) {
			this.leadsheet = leadsheetStructure.leadsheet;
			var repetitions = leadsheetStructure.getRepetitions();
			for (var i = 0; i < repetitions.length; i++) {
				this.repetitions.push(repetitions[i].getConfig());
			}
		}
	};

	return LeadsheetUnfoldConfig;
});