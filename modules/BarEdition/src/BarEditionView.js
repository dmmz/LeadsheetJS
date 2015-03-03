define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, UserLog, pubsub) {

	function BarEditionView(parentHTML) {
		this.el = undefined;
		this.initSubscribe();
		this.initKeyboard();
	}

	BarEditionView.prototype.render = function(parentHTML, force, callback) {
		force = force || false;
		// case el has never been rendered
		var self = this;
		if (typeof this.el === "undefined" || (typeof this.el !== "undefined" && force === true)) {
			this.initView(parentHTML, function() {
				self.initController();
				$.publish('BarEditionView-render');
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

	BarEditionView.prototype.initView = function(parentHTML, callback) {
		var self = this;
		$.get('/modules/BarEdition/src/BarEditionTemplate.html', function(template) {
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
	BarEditionView.prototype.initController = function() {
		$('#add-bar').click(function() {
			$.publish('BarEditionView-addBar');
		});
		$('#rem-bar').click(function() {
			$.publish('BarEditionView-removeBar');
		});

		// Time Signature change
		$('#edit_each_time_signature_container select').change(function() {
			var timeSignature = $(this).val();
			$.publish('BarEditionView-timeSignature', timeSignature);
		});

		// Tonality change
		$('#edit_each_tonality_container select').change(function() {
			var tonality = $(this).val();
			$.publish('BarEditionView-tonality', tonality);
		});

		// Ending change
		$('#edit_each_ending_container select').change(function() {
			var ending = $(this).val();
			$.publish('BarEditionView-ending', ending);
		});

		// Style change
		$('#edit_each_style_container select').change(function() {
			var style = $(this).val();
			$.publish('BarEditionView-style', style);
		});

		// Label change
		$('#edit_each_label_container select').change(function() {
			var label = $(this).val();
			$.publish('BarEditionView-label', label);
		});

		// Sublabel change
		$('#edit_each_sublabel_container select').change(function() {
			var sublabel = $(this).val();
			$.publish('BarEditionView-sublabel', sublabel);
		});

	};

	BarEditionView.prototype.initKeyboard = function(evt) {};



	/**
	 * Subscribe to model events
	 */
	BarEditionView.prototype.initSubscribe = function() {};


	return BarEditionView;
});