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
		var chordSpaceMngType = 'ONLY_CHORDS';

		new ChordSpaceManager(songModel, chordsCursor, viewer, true, null, chordSpaceMngType);
		var viewer = new LSChordSequenceViewer($("#canvas_container")[0],{displayTitle: false, displayComposer: false, saveChords: true, interactiveCanvasLayer: false});
		OnWindowResizer(songModel);

		this.audio = new AudioModule(songModel, {
			chordsCursor: chordsCursor,
			chordSpaceManagerType: chordSpaceMngType
		});
		this.id = songModel._id;
		viewer.draw(songModel);
	}
	return ChordSeq;
});