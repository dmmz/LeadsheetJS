define([], function() {
	function SectionModel_CSLJson(MusicCSLJSON) {

	};
	
	/////////////////////////
	//  Advanced function  //
	/////////////////////////

	SectionModel_CSLJson.prototype.importFromMusicCSLJSON = function(section) {
		//console.log(section);
		this.setName(section.name);
		this.setNumberOfBars(section.bars.length);
		this.setTimeSignature(section.timeSig);
		this.setRepeatTimes(section.repeat ? parseInt(section.repeat) : 0);
		this.setStyle(section.style);
	};

	SectionModel_CSLJson.prototype.exportToMusicCSLJSON = function(sectionModel) {
		var sectionMusicCSLJSON = {};
		sectionMusicCSLJSON.name = sectionModel.getName();

		if (sectionModel.getTimeSignature())
			sectionMusicCSLJSON.timeSig = sectionModel.getTimeSignature();

		if (sectionModel.getRepeatTimes())
			sectionMusicCSLJSON.repeat = sectionModel.getRepeatTimes();

		if (sectionModel.getStyle())
			sectionMusicCSLJSON.style = sectionModel.getStyle();

		return sectionMusicCSLJSON;
	};


	return SectionModel_CSLJson;
});