define([
	'mustache',
	'text!modules/Constraint/src/ConstraintTemplate.html',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
	'jquery'
], function(Mustache, ConstraintTemplate, SongModel, UserLog, pubsub, $) {

	function ConstraintView() {
		this.el = undefined;
		this.render(); // TODO: remove 'render' function?? there seems to be  no reason to leave it (unless it is called from somenwhere else)
	}

	ConstraintView.prototype.render = function() {
		this.el = Mustache.render(ConstraintTemplate);
	};

/*
	ConstraintView.prototype.buildSongsetSelectInterface = function(idSelect, username) {
		getSongsetsByAuthor(username, function(data) {
			var txt = '';
			if (typeof data !== "undefined") {
				for (var index in data) {
					txt += '<option value="' + data[index]._id.$id + '">' + data[index].name + '</option>';
				}
			}
			$('#' + idSelect).html(txt);
		});
	};

	ConstraintView.prototype.buildComposerInterface = function(idSelect, username) {
		var data = getComposerListFromNameOrderBySongs('', 10000, function(data) {
			var composers = [];
			for (var composer in data.result) {
				composers.push(data.result[composer]._id);
			}
			var myconf = {
				autocompleteParams: {
					data: composers,
					autoFill: false,
					maxItemsToShow: 20,
					sortResults: false,
					filterResults: true,
					matchCase: false,
					minChars: 0,
					matchInside: true,
					delay: 50,
				}
			};
			$("#constraint_select_composer").autocomplete(myconf.autocompleteParams);
			$("#constraint_select_composer").contextmenu();
		});
	};

	ConstraintView.prototype.buildSourceInterface = function() {
		getSourcesList(function(data) {
			var options = $("#constraint_select_source");
			for (var elem in data) {
				options.append($("<option />").val(elem).text(data[elem].name + ' (' + data[elem].songs + ')'));
			}
		});
	};


	ConstraintView.prototype.buildTimeSignatureInterface = function() {
		getTimeSignatureList(function(data) {
			var options = $("#constraint_select_timeSignature");
			for (var elem in data.result) {
				options.append($("<option />").val(data.result[elem]._id).text(data.result[elem]._id + ' (' + data.result[elem].songs + ')'));
			}
		});
	};
*/
	ConstraintView.prototype.initController = function() {
		var self = this;
		$('#constraint_compute').click(function() {
			var songset = $('#constraint_select_songsets').val();
			if (songset == "none") {
				songset = null;
			}
			var composer = $('#constraint_select_composer').val();
			if (composer === "") {
				composer = null;
			}
			var source = $('#constraint_select_source').val();
			if (source == "none") {
				source = null;
			}
			var timeSignature = $('#constraint_select_timeSignature').val();
			var numberOfBars = $('#constraint_nbBars').val();
			if (isNaN(numberOfBars)) {
				numberOfBars = 8;
			}
			var computeOptions = {
				'songset': songset,
				'composer': composer,
				'timeSignature': timeSignature,
				'source': source,
				'numberOfBars': numberOfBars
			};
			$.publish('ConstraintView-compute', computeOptions);
			return false;
		});


		// TODO use songsets
		// this.buildSongsetSelectInterface('constraint_select_songsets', globalVariables.username);
		/*
		this.buildComposerInterface();
		this.buildSourceInterface();
		this.buildTimeSignatureInterface();
		*/
	};

	ConstraintView.prototype.unactiveView = function() {
		$.publish('toHistoryView-unactiveView');
	};

	ConstraintView.prototype.activeView = function() {
		$.publish('toHistoryView-activeView');
	};

	return ConstraintView;
});