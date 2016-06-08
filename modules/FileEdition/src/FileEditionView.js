define([
	'jquery',
	'mustache',
	'underscore',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'text!modules/FileEdition/src/FileEditionTemplate.html',
], function($, Mustache, _, SongModel, UserLog, FileEditionTemplate) {
	/**
	 * [FileEditionView description] 
	 * @exports FileEdition/FileEditionView
	 * @param {Object} params {
	 *	import: Boolean,
	 *	export: Boolean,
	 *	extraElementsForMenu: jQuery Object representing DOM fragment
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
		_.defaults(params, {import: true, export: true});
		this.el = $(Mustache.render(FileEditionTemplate, params));
		if (params.extraElementsForMenu) {
			this.el.find('#file_edition_extra_elements_container').append(params.extraElementsForMenu);
		}
	};
	/**
	 * Publish event after receiving dom events
	 */
	FileEditionView.prototype.initController = function() {
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