define([], function() {
	function SectionModel_CSLJson(MusicCSLJSON) {

	};
	
	/////////////////////////
	//  Advanced function  //
	/////////////////////////

	SectionModel_CSLJson.prototype.musicCSLJson2SongModel = function(section) {
		//console.log(section);
		this.setName(section.name);
		this.setNumberOfBars(section.bars.length);
		this.setTimeSignature(section.timeSig);
		this.setRepeatTimes(section.repeat ? parseInt(section.repeat) : 0);
		this.setStyle(section.style);
	};
	
	SectionModel_CSLJson.prototype.songModel2MusicCSLJson = function(songModel) {
		var sectionMusicCSLJSON = {};
		sectionMusicCSLJSON.name = this.getName();

		if (this.getTimeSignature())
			sectionMusicCSLJSON.timeSig = this.getTimeSignature();

		if (this.getRepeatTimes())
			sectionMusicCSLJSON.repeat = this.getRepeatTimes();

		if (this.getStyle())
			sectionMusicCSLJSON.style = this.getStyle();

		return sectionMusicCSLJSON;
	};


	return SectionModel_CSLJson;
});