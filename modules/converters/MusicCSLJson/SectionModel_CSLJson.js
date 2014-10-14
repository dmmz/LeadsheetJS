define(['modules/core/SectionModel'], function(SectionModel) {
	function SectionModel_CSLJson(MusicCSLJSON) {

	};

	/////////////////////////
	//  Advanced function  //
	/////////////////////////

	SectionModel_CSLJson.prototype.importFromMusicCSLJSON = function(JSONSection, sectionModel) {
		if (typeof JSONSection === "undefined" || typeof sectionModel === "undefined" || !(sectionModel instanceof SectionModel)) {
			throw 'SectionModel_CSLJson - importFromMusicCSLJSON - bad arguments type';
		}
		sectionModel.setName(JSONSection.name);
		sectionModel.setNumberOfBars(JSONSection.bars ? parseInt(JSONSection.bars.length) : 0);
		sectionModel.setTimeSignature(JSONSection.timeSig);
		sectionModel.setRepeatTimes(JSONSection.repeat ? parseInt(JSONSection.repeat) : 0);
		sectionModel.setStyle(JSONSection.style);
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