define(['modules/core/src/BarModel'], function(BarModel) {
	var BarModel_MusicXML = {};

	/**
	 * @param  {Object} MusicXMLBar 
	 * @param  {String} prevClef    
	 * @param  {String} prevTimeSig previous time signature
	 * @param  {String} prevKeySig  previous key signature
	 * @return {Object}
	 */
	BarModel_MusicXML.importFromMusicXML = function(MusicXMLBar, prevClef, prevTimeSig, prevKeySig) {
		var bar = new BarModel();
		var keySignature = MusicXMLBar.key;
		if  (keySignature !== prevKeySig) bar.setKeySignatureChange(keySignature);

		var clef = "treble";
		if (MusicXMLBar.hasOwnProperty('stave') && MusicXMLBar.stave[0] !== undefined && MusicXMLBar.stave[0].clef !== undefined) 
		{
			clef = MusicXMLBar.stave[0].clef;
		} else if (MusicXMLBar.hasOwnProperty('clef')) {
			clef = MusicXMLBar.clef;
		}
		if (clef !== prevClef){
			bar.setClef(clef);	
		}
		
		var timeSignature = MusicXMLBar.hasOwnProperty('time') ? MusicXMLBar.time.num_beats + '/' + MusicXMLBar.time.beat_value : '4/4';
			
		if (timeSignature !== prevTimeSig) {
			bar.setTimeSignatureChange(timeSignature);
		}
		return {
			bar:bar,
			clef: clef,
			timeSignature: timeSignature,
			keySignature: keySignature
		};
	};

	return BarModel_MusicXML;
});