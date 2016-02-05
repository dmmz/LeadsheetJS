define([
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/LSViewer/src/LSChordSequenceViewer',
	'modules/LSViewer/src/OnWindowResizer',
	'modules/Audio/src/AudioModule',
	'jquery'
], function(
	SongModel_CSLJson,
	LSChordSequenceViewer,
	OnWindowResizer,
	AudioModule,
	$
) {
	var ChordSeq = {};

	ChordSeq.init = function(MusicCSLJSON) {
		if (MusicCSLJSON === undefined) {
			throw "missing MusicCLJSON song";
		}
		// On second Part we use options to initialize modules
		var songModel = SongModel_CSLJson.importFromMusicCSLJSON(MusicCSLJSON);
		var viewer = new LSChordSequenceViewer($("#canvas_container")[0]);
		OnWindowResizer(songModel);

		var audio = new AudioModule(songModel);
		audio.load('/js/Solar_120_bpm.335.mp3', 120, 0, function(){
			audio.play();	
		});
		
		viewer.draw(songModel);
	}
	return ChordSeq;
});