define(function(){
	var UnfoldedLeadsheet = function(song, unfoldConfig) {
		this.unfoldConfig = unfoldConfig;
		this.title = song.title;
		this.composer = song.composer;
		this.source = song.source;
		this.style = song.style;
		this.tonality = song.tonality; //TODO: change by correct name: key signature
		this.timeSignature = song.timeSignature;
		this.addSections(song.getStructure().getUnfoldedSections(unfoldConfig));
	};

	UnfoldedLeadsheet.addSections = function(first_argument) {
		
	};
});