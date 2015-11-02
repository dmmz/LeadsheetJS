define(['modules/core/src/BarModel'], function(BarModel) {
	var BarModel_MusicXML = {};

	BarModel_MusicXML.importFromMusicXML = function(MusicXMLBar) {
		var bar = new BarModel();
		if (MusicXMLBar.hasOwnProperty('key')) bar.setKeySignatureChange(MusicXMLBar.key);
		var clef = "treble";
		if (MusicXMLBar.hasOwnProperty('stave') && typeof MusicXMLBar.stave[0] !== "undefined" && typeof MusicXMLBar.stave[0].clef !== "undefined") {
			clef = MusicXMLBar.stave[0].clef;
		} else if (MusicXMLBar.hasOwnProperty('clef')) {
			clef = MusicXMLBar.clef;
		}
		bar.setClef(clef);
		if (MusicXMLBar.hasOwnProperty('time')) {
			bar.setTimeSignatureChange(MusicXMLBar.time.num_beats + '/' + MusicXMLBar.time.beat_value);
		} else {
			bar.setTimeSignatureChange('4/4');
		}
		return bar;
	};

	return BarModel_MusicXML;
});