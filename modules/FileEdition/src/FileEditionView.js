define([
	'jquery',
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
	'text!modules/FileEdition/src/FileEditionTemplate.html',
], function($, Mustache, SongModel, UserLog, pubsub, FileEditionTemplate) {

	function FileEditionView(parentHTML) {
		this.el = undefined;
		this.initSubscribe();
		this.initKeyboard();
	}

	FileEditionView.prototype.render = function(parentHTML, callback) {
		var rendered = Mustache.render(FileEditionTemplate);
		if (typeof parentHTML !== "undefined") {
			parentHTML.innerHTML = rendered;
		}
		this.el = rendered;
		this.initController();
	//	$.publish('FileEditionView-render');
		if (typeof callback === "function") {
			callback();
		}
		return;	
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
		$('#importFile').change(function(e) {
			var file = e.target.files[0];
			var allowedTypes = ['json', 'xml', 'mxml'];
			var extension = file.name.split('.');
			extension = extension[extension.length - 1];
			var type = allowedTypes.indexOf(extension);
			if (!file || type === -1) {
				return;
			}
			var reader = new FileReader();
			reader.onload = function(e) {
				if (type === 0) {
					$.publish('FileEditionView-importMusicCSLJSON', JSON.parse(e.target.result));
				} else {
					$.publish('FileEditionView-importMusicXML', e.target.result);
				}
			};
			reader.readAsText(file);
			return false;
		});

		// export sound
		$('#export_mp3').click(function() {
			var chord = $('#export_sound_chords').prop("checked");
			var tick = $('#export_sound_tick').prop("checked");
			var style = $('#sound_export_style').val();
			$.publish('FileEditionView-sound_export', {
				'exportType': 'mp3',
				'chord': chord,
				'tick': tick,
				'style': style
			});
		});

		$('#export_wav').click(function() {
			var chord = $('#export_sound_chords').prop("checked");
			var tick = $('#export_sound_tick').prop("checked");
			var style = $('#sound_export_style').val();
			$.publish('FileEditionView-sound_export', {
				'exportType': 'wav',
				'chord': chord,
				'tick': tick,
				'style': style
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