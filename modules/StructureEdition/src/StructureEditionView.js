define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'jquery',
	'pubsub',
	'text!modules/StructureEdition/src/StructureEditionTemplate.html',
], function(Mustache, SongModel, UserLog, $, pubsub, StructureEditionTemplate) {

	function StructureEditionView(imgPath) {
		this.el = undefined;
		this.imgPath = imgPath;
		this.initSubscribe();
		this.initKeyboard();
		this.render();
	}

	StructureEditionView.prototype.render = function(parentHTML, callback) {
		//if (typeof this.el === "undefined" || (typeof this.el !== "undefined" && force === true)) {
		this.el = Mustache.render(StructureEditionTemplate, {
			'imgPath': this.imgPath
		});
	};

	/**
	 * Publish event after receiving dom events
	 */
	StructureEditionView.prototype.initController = function() {
		$('#add-section').click(function() {
			$.publish('StructureEditionView-addSection');
		});
		$('#rem-section').click(function() {
			$.publish('StructureEditionView-removeSection');
		});
		$('#validateSectionTitle').click(function() {
			var name = $('#inputSectionName').val();
			$.publish('StructureEditionView-sectionName', name);
		});
		$('#selectSectionRepeatTimes').change(function() {
			var repeatTimes = parseInt($(this).val(), 10) - 1; // number of repetition is the number of played times minus 1
			$.publish('StructureEditionView-repeatTimes', repeatTimes);
		});

		$('#add-bar').click(function() {
			$.publish('StructureEditionView-addBar');
		});
		$('#rem-bar').click(function() {
			$.publish('StructureEditionView-removeBar');
		});

		// Time Signature change
		$('#edit_each_time_signature_container select').change(function() {
			var timeSignature = $(this).val();
			$.publish('StructureEditionView-timeSignature', timeSignature);
		});

		// Tonality change
		$('#edit_each_tonality_container select').change(function() {
			var tonality = $(this).val();
			$.publish('StructureEditionView-tonality', tonality);
		});

		// Ending change
		$('#edit_each_ending_container select').change(function() {
			var ending = $(this).val();
			$.publish('StructureEditionView-ending', ending);
		});

		// Style change
		$('#edit_each_style_container select').change(function() {
			var style = $(this).val();
			$.publish('StructureEditionView-style', style);
		});

		// Label change
		$('#edit_each_label_container select').change(function() {
			var label = $(this).val();
			$.publish('StructureEditionView-label', label);
		});

		// Sublabel change
		$('#edit_each_sublabel_container select').change(function() {
			var sublabel = $(this).val();
			$.publish('StructureEditionView-sublabel', sublabel);
		});
		$('#unfold').click(function() {
			var sublabel = $(this).val();
			$.publish('StructureEditionView-unfold');
		});
	};

	StructureEditionView.prototype.initKeyboard = function(evt) {};



	/**
	 * Subscribe to model events
	 */
	StructureEditionView.prototype.initSubscribe = function() {
		$.subscribe('StructureEditionModel-toggleUnfolded', function(el, unfolded) {
			var textButton = unfolded ? "Fold" : "Unfold";
			$("#unfold").val(textButton);
		});
	};


	StructureEditionView.prototype.unactiveView = function(idElement) {
		$.publish('StructureEditionView-unactiveView');
	};

	StructureEditionView.prototype.activeView = function(idElement) {
		$.publish('StructureEditionView-activeView', 'notes');
	};

	return StructureEditionView;
});