define(function(){
	var UnfoldedLeadsheet = function(song, unfoldConfig, segments) {
		this.unfoldConfig = unfoldConfig;
		this.title = song.title;
		this.composer = song.composer;
		this.source = song.source;
		this.style = song.style;
		this.tonality = song.tonality; //TODO: change by correct name: key signature
		this.timeSignature = song.timeSignature;
		this.changes = [];

		var struct = song.getStructure();
		this.addSections(struct.getUnfoldedSections(unfoldConfig, segments));
	};

	UnfoldedLeadsheet.addSections = function() {
		
	};

	return UnfoldedLeadsheet;
});