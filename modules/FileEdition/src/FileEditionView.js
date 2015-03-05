define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, UserLog, pubsub) {

	function FileEditionView(parentHTML) {
		this.el = undefined;
		this.initSubscribe();
		this.initKeyboard();
	}

	FileEditionView.prototype.render = function(parentHTML, force, callback) {
		force = force || false;
		// case el has never been rendered
		var self = this;
		if (typeof this.el === "undefined" || (typeof this.el !== "undefined" && force === true)) {
			this.initView(parentHTML, function() {
				self.initController();
				$.publish('FileEditionView-render');
				if (typeof callback === "function") {
					callback();
				}
				return;
			});
		} else {
			if (typeof callback === "function") {
				callback();
			}
			return;
		}
	};

	FileEditionView.prototype.initView = function(parentHTML, callback) {
		var self = this;
		$.get('/modules/FileEdition/src/FileEditionTemplate.html', function(template) {
			var rendered = Mustache.render(template);
			if (typeof parentHTML !== "undefined") {
				parentHTML.innerHTML = rendered;
			}
			self.el = rendered;
			if (typeof callback === "function") {
				callback();
			}
		});
	};

	/**
	 * Publish event after receiving dom events
	 */
	FileEditionView.prototype.initController = function() {
		$('#add-bar').click(function() {
			$.publish('FileEditionView-addBar');
		});
		var self = this;
		// Leadsheet parameters
		/*$('#leadsheet_save').click(function() {

		});

		$('#leadsheet_edit_chord_sequence').click(function() {

		});

		$('#leadsheet_key_title').click(function() {

		});*/

		$('#import_musicCslJson').click(function() {
			$.publish('FileEditionView-importMusicCSLJSON');
		});
		$('#import_musicXML').click(function() {
			$.publish('FileEditionView-importMusicXML');
		});

		// export sound
		$('#export_mp3').click(function() {
			var chord = $('#export_sound_chords').prop("checked");
			var tick = $('#export_sound_tick').prop("checked");
			$.publish('FileEditionView-sound_export', {
				'exportType': 'mp3',
				'chord': chord,
				'tick': tick
			});
		});

		$('#export_wav').click(function() {
			var chord = $('#export_sound_chords').prop("checked");
			var tick = $('#export_sound_tick').prop("checked");
			$.publish('FileEditionView-sound_export', {
				'exportType': 'wav',
				'chord': chord,
				'tick': tick
			});
		});

		$('#export_midi').click(function() {
			var chord = $('#export_sound_chords').prop("checked");
			var tick = $('#export_sound_tick').prop("checked");
			$.publish('FileEditionView-sound_export', {
				'exportType': 'mid',
				'chord': chord,
				'tick': tick
			});
		});

		// leadsheet export
		$('#export_png').click(function() {
			$.publish('FileEditionView-exportPNG');
		});

		$('#export_pdf').click(function() {
			$.publish('FileEditionView-exportPDF');

		});

		$('#export_musicCslJson').click(function() {
			$.publish('FileEditionView-exportMusicCSLJSON');
		});
	};

	FileEditionView.prototype.initKeyboard = function(evt) {};

	/**
	 * Subscribe to model events
	 */
	FileEditionView.prototype.initSubscribe = function() {};


	return FileEditionView;
});