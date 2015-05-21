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
		var fn;
		$('#add-section').click(function() {
			fn  = 'addSection';
			$.publish('StructureEditionView',fn);
		});
		$('#rem-section').click(function() {
			fn = 'removeSection';
			$.publish('StructureEditionView',fn);
		});
		$('#validateSectionTitle').click(function() {
			var name = $('#inputSectionName').val();
			fn = 'setSectionName';
			$.publish('StructureEditionView',[fn, name] );
		});
		$('#selectSectionRepeatTimes').change(function() {
			var repeatTimes = parseInt($(this).val(), 10) - 1; // number of repetition is the number of played times minus 1
			fn = 'setRepeatTimes';
			$.publish('StructureEditionView', [fn, repeatTimes]);
		});


		$('#add-bar').click(function() {
			fn = 'addBar';
			$.publish('StructureEditionView', fn);
		});
		$('#rem-bar').click(function() {
			fn = 'removeBar';
			$.publish('StructureEditionView', fn);
		});

		// Time Signature change
		$('#edit_each_time_signature_container select').change(function() {
			fn = 'setTimeSignature';
			var timeSignature = $(this).val();
			$.publish('StructureEditionView', [fn,timeSignature]);
		});

		// Tonality change
		$('#edit_each_tonality_container select').change(function() {
			fn = 'tonality';
			var tonality = $(this).val();
			$.publish('StructureEditionView', [fn, tonality]);
		});

		// Ending change
		$('#edit_each_ending_container select').change(function() {
			var ending = $(this).val();
			fn = 'ending';
			$.publish('StructureEditionView', [fn, ending]);
		});

		// Style change
		$('#edit_each_style_container select').change(function() {
			var style = $(this).val();
			fn = 'style';
			$.publish('StructureEditionView-', [fn, style]);
		});

		// Label change
		$('#edit_each_label_container select').change(function() {
			var label = $(this).val();
			fn = 'label';
			$.publish('StructureEditionView', [fn, label]);
		});

		// Sublabel change
		$('#edit_each_sublabel_container select').change(function() {
			var sublabel = $(this).val();
			fn = 'subLabel';
			$.publish('StructureEditionView', [fn, sublabel]);
		});
		$('#unfold').click(function() {
			$.publish('StructureEditionView','unfold');
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