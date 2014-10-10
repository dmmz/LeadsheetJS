define([], function() {
	function BarModel_CSLJson(MusicCSLJSON) {

	};
	
	/////////////////////////
	//  Advanced function  //
	/////////////////////////

	BarModel_CSLJson.prototype.musicCSLJson2SongModel = function(JSONBar) {
		var self = this;
		var labels = ["segno", "segno2", "fine", "coda", "coda2", "on cue"];
		labels.forEach(function(label) {
			if (JSONBar.hasOwnProperty(label)) {
				self.setLabel(label);
			}
		});
		//so far now we allow only one label per bar in the DB, but this code is prepared to allow more than one, as an array
		if (JSONBar.hasOwnProperty('ending')) self.setEnding(JSONBar.ending);
		if (JSONBar.hasOwnProperty('sublabel')) self.setSublabel(JSONBar.sublabel);
		if (JSONBar.hasOwnProperty('timeSignature')) self.setTimeSignature(JSONBar.timeSignature);

	};
	BarModel_CSLJson.prototype.songModel2MusicCSLJson = function(songModel) {
		var bar = {};

		if (this.getLabel())
			bar[this.getLabel()] = 1;

		if (this.getEnding())
			bar.ending = this.getEnding();

		if (this.getSublabel())
			bar.sublabel = this.getSublabel();

		if (this.getTimeSignature())
			bar.timeSignature = this.getTimeSignature();

		return bar;

	};

	return BarModel_CSLJson;
});
	