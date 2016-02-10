define([
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/LSViewer/src/LSChordSequenceViewer',
	'modules/LSViewer/src/OnWindowResizer',
	'modules/Audio/src/AudioModule',
	'modules/ChordEdition/src/ChordSpaceManager',
	'modules/Cursor/src/CursorModel',
	'utils/AjaxUtils',
	'jquery'
], function(
	SongModel_CSLJson,
	LSChordSequenceViewer,
	OnWindowResizer,
	AudioModule,
	ChordSpaceManager,
	CursorModel,
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
		var chordsCursor = new CursorModel(songModel.getComponent('chords'));
		new ChordSpaceManager(songModel, chordsCursor, viewer, true);
		var viewer = new LSChordSequenceViewer($("#canvas_container")[0],{displayTitle: false, displayComposer: false});
		OnWindowResizer(songModel);

		viewer.draw(songModel);
		this.audio = new AudioModule(songModel);
		this.id = songModel._id;
	}
	return ChordSeq;
});