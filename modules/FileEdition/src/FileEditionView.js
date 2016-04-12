define([
	'jquery',
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
	'text!modules/FileEdition/src/FileEditionTemplate.html',
], function($, Mustache, SongModel, UserLog, pubsub, FileEditionTemplate) {
	/**
	 * [FileEditionView description] 
	 * @exports FileEdition/FileEditionView
	 * @param {Object} params {
	 *	import: Boolean,
	 *	export: Boolean,
	 *	save: Boolean
	 * }
	 */
	function FileEditionView(params) {
		this.el = undefined;
		this.initSubscribe();
		this.initKeyboard();
		this.render(params);
	}

	FileEditionView.prototype.render = function(params) {
		
		params = params || {};
		params.import = (params.import !== undefined) ? params.import : true;
		params.export = (params.export !== undefined) ? params.export : true;
		params.save = (params.save !== undefined) ? params.save : true;
		this.el = Mustache.render(FileEditionTemplate, params);
	};
	/**
	 * Publish event after receiving dom events
	 */
	FileEditionView.prototype.initController = function() {

		var self = this;
		// Leadsheet parameters
		$('#leadsheet_save').click(function() {
			$.publish('FileEditionView-save');
		});
		$('#leadsheet_save_as').click(function() {
			$.publish('FileEditionView-saveAs');
		});

		/*
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