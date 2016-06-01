define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/converters/MusicXML/src/SongModel_MusicXML',
	'modules/LSViewer/src/LSViewer',
	'jsPDF',
	'jquery'
], function(Mustache, SongModel, SongModel_CSLJson, SongModel_MusicXML, LSViewer, jsPDF, $) {
	/**
	 * FileEditionController manages all file interaction like save, import, export
	 * @exports FileEdition/FileEditionController
	 */
	function FileEditionController(songModel, viewer) {
		if (viewer) {
			this.viewer = viewer;
			if (viewer.canvas) {
				this.viewerCanvas = viewer.canvas;
			}
		}
		this.songModel = songModel || new SongModel();
		this.initSubscribe();
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
		$.subscribe('FileEditionView-exportPNG', function(el){ self.exportPNG();});
		$.subscribe('FileEditionView-exportPDF', function(el) {
			self.exportAndPromptLeadsheetToPDF(
				self.songModel.getTitle(),
				self.songModel.getComposer(),
				self.songModel.getTimeSignature(),
				self.songModel.getStyle()
			);
		});
		$.subscribe('FileEditionView-exportMusicCSLJSON', self.exportLeadsheetJSON);
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
		
		function drawPage(totalSumHeight, pageSumHeight, i){
			//create new canvas
			var destinationCanvas = document.createElement("CANVAS");
			destinationCanvas.width = srcCanvas.width;
			destinationCanvas.height = srcCanvas.height;
			// set white background
			var destCtx = destinationCanvas.getContext('2d');
				destCtx.fillStyle = "#FFFFFF";
				destCtx.fillRect(0, 0, destinationCanvas.width, destinationCanvas.height);
			
			//set offset start and end Y to create new page
			var startY = totalSumHeight - lineHeight * 0.34; // startY is relative to lineHeight
			var endY = pageSumHeight;
			// draw new image clipping original image
			destCtx.drawImage(currentViewer.canvas, 0,  startY, srcCanvas.width,  endY , 0, 0, srcCanvas.width, endY);
						
			if (i > 0){
				doc.addPage();
			}

			imgData = destinationCanvas.toDataURL('image/jpeg', 1);
			doc.addImage(imgData, 'JPEG', 10, 0, dina4Width, totalHeight);
		}


		var doc = new jsPDF();
		var dina4Width = 200;	//dinA4  210 * 297
		var dina4Height = 283; //282,857142857
		var srcCanvas = this.viewerCanvas;
		var destinationElement = document.createElement("div");
		var currentViewer = new LSViewer(destinationElement, {
			'width': srcCanvas.width - 10
		});

		currentViewer.setLineHeight(this.viewer.getLineHeight());
		currentViewer.draw(this.songModel);

		var totalHeight = dina4Width * (srcCanvas.height / srcCanvas.width); // total height on pdf
		var imgPageHeight = (dina4Height / dina4Width) * srcCanvas.width;    // height on pdf
		var lineHeight = this.viewer.getLineHeight();	
		
		var i = 0;
			totalSumHeight = 0;
			pageSumHeight = this.viewer.marginTop;

		// we draw each page 
		while (totalSumHeight < srcCanvas.height){
			if (pageSumHeight + lineHeight > imgPageHeight || totalSumHeight + pageSumHeight >= srcCanvas.height){
				drawPage(totalSumHeight, pageSumHeight, i);
				totalSumHeight += pageSumHeight;
				pageSumHeight = 0;	
				i++;
			}else{
				pageSumHeight += lineHeight;
			}
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
		// Code is a bit special for json because we transform data and we add a 'data:' prefix after href to make it work
		var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(JSONSong));
		var export_link = $('<a>', {
			download: this.songModel.getTitle() + '.json',
			href: 'data:' + data
		}).prependTo('body');
		export_link[0].click();
		export_link.remove();
	};

	return FileEditionController;
});