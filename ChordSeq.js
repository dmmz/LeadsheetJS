define([
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/LSViewer/src/LSChordSequenceViewer',
	'modules/LSViewer/src/OnWindowResizer',
	'modules/Audio/src/AudioModule',
	'utils/AjaxUtils',
	'jquery'
], function(
	SongModel_CSLJson,
	LSChordSequenceViewer,
	OnWindowResizer,
	AudioModule,
	AjaxUtils,
	$
) {
	var ChordSeq = {
		"AjaxUtils": AjaxUtils
	};

	ChordSeq.init = function(MusicCSLJSON) {
		if (MusicCSLJSON === undefined) {
			throw "missing MusicCLJSON song";
		}
		// On second Part we use options to initialize modules
		var songModel = SongModel_CSLJson.importFromMusicCSLJSON(MusicCSLJSON);
		var viewer = new LSChordSequenceViewer($("#canvas_container")[0],{displayTitle: false, displayComposer: false});
		OnWindowResizer(songModel);

		viewer.draw(songModel);
		this.audio = new AudioModule(songModel);
		this.id = songModel._id;
	}
	return ChordSeq;
});