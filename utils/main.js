define([
		"utils/AjaxUtils",
		"utils/ChordUtils",
		"utils/NoteUtils",
		"utils/PopIn",
		"utils/UserLog",
	],
	function(
		AjaxUtils,
		ChordUtils,
		NoteUtils,
		PopIn,
		UserLog
	) {
		return {
			"AjaxUtils": AjaxUtils,
			"ChordUtils": ChordUtils,
			"NoteUtils": NoteUtils,
			"PopIn": PopIn,
			"UserLog": UserLog,
		};
	}
);