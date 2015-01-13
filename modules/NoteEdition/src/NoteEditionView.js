define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, UserLog, pubsub) {

	function NoteEditionView(parentHTML) {
		this.el = undefined;
	}

	NoteEditionView.prototype.render = function(parentHTML, force, callback) {
		force = force || false;
		// case el has never been rendered
		var self = this;
		if (typeof this.el === "undefined" || (typeof this.el !== "undefined" && force === true)) {
			this.initView(parentHTML, function() {
				self.initController();
				$.publish('NoteEditionView-render');
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

	NoteEditionView.prototype.initView = function(parentHTML, callback) {
		var self = this;
		$.get('/modules/NoteEdition/src/NoteEditionTemplate.html', function(template) {
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
	NoteEditionView.prototype.initController = function() {
		// pitch
		$('#aug-note').click(function() {
			$.publish('NoteEditionView-setCurrKey', 1);
		});
		$('#sub-note').click(function() {
			$.publish('NoteEditionView-setCurrKey', -1);
		});

		// Alteration
		$('#flat').click(function() {
			$.publish('NoteEditionView-addAccidental', 'b');
		});
		$('#natural').click(function() {
			$.publish('NoteEditionView-addAccidental', 'n');
		});
		$('#sharp').click(function() {
			$.publish('NoteEditionView-addAccidental','#');
		});

		// Rhythm
		$('#whole-note').click(function() {
			$.publish('NoteEditionView-setCurrDuration',7);
		});
		$('#half-note').click(function() {
			$.publish('NoteEditionView-setCurrDuration',6);
		});
		$('#quarter-note').click(function() {
			$.publish('NoteEditionView-setCurrDuration',5);
		});
		$('#eight-note').click(function() {
			$.publish('NoteEditionView-setCurrDuration',4);
		});
		$('#sixteenth-note').click(function() {
			$.publish('NoteEditionView-setCurrDuration',3);
		});
		$('#thirty-second-note').click(function() {
			$.publish('NoteEditionView-setCurrDuration',2);
		});
		$('#sixty-four-note').click(function() {
			$.publish('NoteEditionView-setCurrDuration',1);
		});
		$('#dot').click(function() {
			$.publish('NoteEditionView-setDot');
		});

		// Symbol
		$('#tie-note').click(function() {
			$.publish('NoteEditionView-setTie');
		});
		$('#tuplet').click(function() {
			$.publish('NoteEditionView-setTuplet', true);
		});


		// Note
		$('#silent-note').click(function() {
			$.publish('NoteEditionView-setSilence');
		});
		$('#regular-note').click(function() {
			$.publish('NoteEditionView-setCurrKey','B');
		});
		$('#delete-note').click(function() {
			$.publish('NoteEditionView-deleteNote');
		});
		$('#add-note').click(function() {
			$.publish('NoteEditionView-addNote');
		});

		// Selection
		$('#copy-note').click(function() {
			$.publish('NoteEditionView-copyNotes');
		});
		$('#paste-note').click(function() {
			$.publish('NoteEditionView-pasteNotes');
		});
	};


	/**
	 * Subscribe to model events
	 */
	NoteEditionView.prototype.initSubscribe = function() {};

	return NoteEditionView;
});
	