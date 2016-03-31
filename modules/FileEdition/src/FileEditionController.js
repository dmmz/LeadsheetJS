define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/converters/MusicXML/src/SongModel_MusicXML',
	'modules/LSViewer/src/LSViewer',
	'pubsub',
	'utils/UserLog',
	'utils/apiFlowMachines/ComposerServlet',
	'utils/PopIn',
	'jsPDF',
	'jquery'
], function(Mustache, SongModel, SongModel_CSLJson, SongModel_MusicXML,LSViewer, pubsub, UserLog, ComposerServlet, PopIn, jsPDF, $) {
	/**
	 * FileEditionController manages all file interaction like save, import, export
	 * @exports FileEdition/FileEditionController
	 */
	function FileEditionController(songModel, viewer, saveFunction, saveAs) {
		if (viewer) {
			this.viewer = viewer;
			if (viewer.canvas) {
				this.viewerCanvas = viewer.canvas;
			}
		}
		this.songModel = songModel || new SongModel();
		this.initSubscribe();
		var self = this;
		if (saveAs){
			this.initSubscribeSaveAS();
		}
		if (saveFunction) {
			this.saveFn = saveFunction;
		}
	}

	/**
	 * Subscribe to view events
	 */
	FileEditionController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('FileEditionView-importMusicCSLJSON', function(el, JSONSong) {
			self.importMusicCSLJSON(JSONSong);
		});
		$.subscribe('FileEditionView-importMusicXML', function(el, musicXMLSong) {
			self.importMusicXML(musicXMLSong);
		});

		$.subscribe('FileEditionView-exportPNG', function(el) {
			self.exportPNG();
		});
		$.subscribe('FileEditionView-exportPDF', function(el) {
			self.exportAndPromptLeadsheetToPDF(self.songModel.getTitle(), self.songModel.getComposer(), self.songModel.getTimeSignature(), self.songModel.getStyle());
		});
		$.subscribe('FileEditionView-exportMusicCSLJSON', function(el) {
			self.exportLeadsheetJSON();
		});
		$.subscribe('FileEditionView-save', function(el) {
			self.save();
		});
		$.subscribe('FileEditionView-saveAs', function(el) {
			self.saveAs();
		});
	};
	//TODO: this logic is dependent on the application that uses LeadsheetJS, not on LeadsheetJS, maybe it should be moved, just like 'save' function
	FileEditionController.prototype.initSubscribeSaveAS = function(first_argument) {	
		var content = 	"<div class='controls form-inline'>"+
						"<label style='padding:5px;'>New Title</label><input name='title' type='text'></input>"+
						"&nbsp;&nbsp;<label style='padding:5px;'>Link to original lead sheet</label><input type='checkbox' name='linked' checked='true'/>"+
						"</div>";
		var classTitle = "saveAs";
		this.popin = new PopIn('Save As', content, {classTitle:classTitle});
		this.popin.render();
		var self = this;
		$(document).on('click','.'+ classTitle +' .modal_submit', function(data){
			var title = $("input[name=title]").val();
			title = title || 'Copy of ' + self.songModel.getTitle();
			self.songModel.setTitle(title);
			var linked = $("input[name='linked']")[0].checked;
			self.save(self.songModel, false, linked);
			$.publish('ToViewer-draw', self.songModel);
		});

	};

	FileEditionController.prototype.importMusicCSLJSON = function(JSONSong) {
		if (typeof JSONSong === "undefined") {
			throw 'FileEditionController - importMusicCSLJSON File imported is not defined ' + JSONSong;
		}
		SongModel_CSLJson.importFromMusicCSLJSON(JSONSong, this.songModel);
		$.publish('ToHistory-add', 'Open MusicCSLJson - ' + this.songModel.getTitle());
		$.publish('ToViewer-draw', [this.songModel, true]);
	};

	FileEditionController.prototype.importMusicXML = function(musicXMLSong) {
		if (typeof musicXMLSong === "undefined") {
			throw 'FileEditionController - importMusicXML File imported is not defined ' + musicXMLSong;
		}
		SongModel_MusicXML.importFromMusicXML(musicXMLSong, this.songModel);
		$.publish('ToHistory-add', 'Open MusicXML - ' + this.songModel.getTitle());
		$.publish('ToViewer-draw', this.songModel);
	};

	/**
	 * Propose file to be downloaded by user
	 * @param  {String} title     title of file downloaded, title can contain extension eg "my_file" or "my_file.png"
	 * @param  {String} path      Real path to download from eg "www.url.com/my_tmp_file_is_here.mp3"
	 * @param  {String} extension optionnal arguments, if defined, be carefull to write the dot at begining, eg ".mp3"
	 */
	FileEditionController.prototype.promptFile = function(title, path, extension) {
		if (typeof extension === "undefined") {
			extension = '';
		}
		var export_link = $('<a>', {
			download: title + extension,
			href: path
		}).prependTo('body');
		export_link[0].click();
		export_link.remove();
	};


	FileEditionController.prototype.exportPNG = function() {
		var resolutionRatio = 3; // don't go over 3-4 because then toDataUrl is getting too big on long leadsheet and export doesn't work
		// augment resolution
		this.viewer.canvas.width = this.viewer.canvas.width * resolutionRatio;
		this.viewer.typeResize = 'scale';
		this.viewer._resize(this.viewer.canvas.width);
		this.viewer.draw(this.songModel);

		// screenshot and export
		this.promptFile(this.songModel.getTitle() + '.png', this.viewer.canvas.toDataURL("image/png"));

		// reduce resolution
		this.viewer.typeResize = 'fluid';
		this.viewer.canvas.width = Math.ceil(this.viewer.canvas.width / resolutionRatio);
		this.viewer._resize(this.viewer.canvas.width);
		this.viewer.draw(this.songModel);
	};

	FileEditionController.prototype.exportAndPromptLeadsheetToPDF = function(title, composer, timeSignature, style, sources_abr) {
		var srcCanvas = this.viewerCanvas;
		// create a dummy CANVAS to create a new viewer without selection or edition
		var destinationElement = document.createElement("div");
		var currentViewer = new LSViewer(destinationElement, {
			'width': srcCanvas.width - 10
		});
		currentViewer.setLineHeight(this.viewer.getLineHeight());
		currentViewer.draw(this.songModel);

		// create another dummy CANVAS in which we will draw the first canvas, it prevents black screen to appear
		var destinationCanvas = document.createElement("canvas");
		destinationCanvas.width = srcCanvas.width;
		destinationCanvas.height = srcCanvas.height;
		var destCtx = destinationCanvas.getContext('2d');
		// create a rectangle with the desired color
		destCtx.fillStyle = "#FFFFFF";
		destCtx.fillRect(0, 0, srcCanvas.width, srcCanvas.height);
		// draw the original canvas onto the destination canvas
		destCtx.drawImage(currentViewer.canvas, 0, 0);
		var imgData = destinationCanvas.toDataURL('image/jpeg', 1);

		var totalWidth = 200;
		var totalHeight = totalWidth * (srcCanvas.height / srcCanvas.width);

		var doc = new jsPDF();
		doc.setFontSize(34);
		// doc.text(15, 20, title);
		// doc.setFontSize(18);
		// doc.text(15, 30, composer);
		doc.addImage(imgData, 'JPEG', 10, 23, totalWidth, totalHeight);
		doc.setFontSize(10);
		doc.text(15, 20, style + ' (' + timeSignature + ')');
		if (totalHeight >= 365) {
			doc.addPage();
			doc.addImage(imgData, 'JPEG', 10, -270, totalWidth, totalHeight);
		}
		if (sources_abr && sources_abr !== "") {
			sources_abr = '_' + sources_abr;
		} else {
			sources_abr = '';
		}
		doc.save(title + sources_abr + '.pdf');
	};

	FileEditionController.prototype.exportLeadsheetJSON = function() {
		var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel);
		// Code is a bit special for json because we transform data and we add a 'data:' prefix after href to make it works
		var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(JSONSong));
		var export_link = $('<a>', {
			download: this.songModel.getTitle() + '.json',
			href: 'data:' + data
		}).prependTo('body');
		export_link[0].click();
		export_link.remove();
	};

	FileEditionController.prototype.save = function(newLeadsheet, showConfirm, derived) {
		
		showConfirm = showConfirm !== undefined ? showConfirm : true;

		var songId;
		if (!newLeadsheet && this.songModel._id !== undefined) {
			songId = this.songModel._id;
		}
		var derivedId = derived ? this.songModel._id : null;

		this.songModel._id = undefined; // we need to clean songModel id otherwise update doesn't work
		var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel);

		if (this.saveFn !== undefined) {
			if (showConfirm && !confirm("Are you sure you want to save the changes in "+this.songModel.getTitle()+"?")){
				return;
			}
			var self = this;
			var idLog = UserLog.log('info', 'Saving...');
			this.saveFn(JSONSong, songId, {derivedId: derivedId}, function(data) {
				UserLog.removeLog(idLog);
				if (data.error) {
					UserLog.logAutoFade('error', data.msg);
				} else {
					UserLog.logAutoFade('success', 'Leadsheet saved with success');
				}
				self.songModel._id = data.id;
			});
		}
	};

	FileEditionController.prototype.saveAs = function() {
		this.popin.show();
	};


	return FileEditionController;
});