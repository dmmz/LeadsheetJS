define(['jquery', 'modules/core/src/SongModel', 'modules/core/src/SectionModel', 'modules/core/src/BarManager', 'modules/core/src/BarModel', 'modules/core/src/ChordManager', 'modules/core/src/ChordModel'],
	function($, SongModel, SectionModel, BarManager, BarModel, ChordManager, ChordModel) {
		/**
		 * SongView_chordSequence is a text view created from SongModel that display mainly chords.
		 * This view is usefull for musicians who use only a chord grid to play.
		 * @exports ChordSequence
		 */
		function SongView_chordSequence(parentHTML, songModel, option) {
			option = option || {};
			this.el = parentHTML;
			// songModel
			this.songModel = (typeof songModel !== "undefined" && songModel instanceof SongModel) ? songModel : undefined;

			// display general option
			this.displayTitle = (typeof option.displayTitle !== "undefined") ? option.displayTitle : true;
			this.classTitle = (typeof option.classTitle !== "undefined") ? option.classTitle : 'song_view-title';
			this.displayComposer = (typeof option.displayComposer !== "undefined") ? option.displayComposer : true;
			this.displayBar = (typeof option.displayBar !== "undefined") ? option.displayBar : true;
			this.delimiterBar = (typeof option.delimiterBar !== "undefined") ? option.delimiterBar : "|";
			this.delimiterNewLine = (typeof option.delimiterNewLine !== "undefined") ? option.delimiterNewLine : "<br />";
			this.delimiterBeat = (typeof option.delimiterBeat !== "undefined") ? option.delimiterBeat : "";
			this.displaySection = (typeof option.displaySection !== "undefined") ? option.displaySection : true;
			this.fillEmptyBar = (typeof option.fillEmptyBar !== "undefined") ? option.fillEmptyBar : true;
			this.fillEmptyBarCharacter = (typeof option.fillEmptyBarCharacter !== "undefined") ? option.fillEmptyBarCharacter : "%";
			this._initSubscribe();
		}

		SongView_chordSequence.prototype._initSubscribe = function() {
			var self = this;
			$.subscribe('ToViewer-draw', function(el, songModel) {
				self.draw();
			});
		};

		SongView_chordSequence.prototype.draw = function() {
			var txt = '';
			if (typeof this.songModel !== "undefined") {
				if (this.displayTitle === true) {
					txt += '<span class="song_view-title">' + this.songModel.getTitle() + '</span> ';
				}
				if (this.displayComposer === true) {
					txt += '(' + this.songModel.getComposer() + ')';
				}
				if (this.displayTitle === true || this.displayComposer === true) {
					txt += this.delimiterNewLine;
				}
				var bm = this.songModel.getComponent("bars");
				var sectionsLength = this.songModel.getSections().length;
				for (var i = 0; i < sectionsLength; i++) {
					txt += this.delimiterNewLine;
					txt += this.getSectionView(i);
					if (this.displayBar === true) {
						var currentBar;
						var chordDuration;
						var cm;
						for (var currentBarNumber = 0, c = bm.getBars().length; currentBarNumber < c; currentBarNumber++) {
							currentBar = bm.getBar(currentBarNumber);
							if (currentBarNumber !== 0) {
								txt += this.delimiterBar;
							}
							if (typeof currentBar.ending !== "undefined" && (currentBar.ending === 'BEGIN' || currentBar.ending === 'BEGIN_END')) {
								txt += ':';
							}
							if (currentBarNumber !== 0) {
								txt += ' ';
							}
							var chordsInCurrentBar = this.songModel.getComponentsAtBarNumber(currentBarNumber, 'chords');
							if (chordsInCurrentBar.length === 0 && this.fillEmptyBar === true) {
								txt += this.fillEmptyBarCharacter + ' ';
							} else {
								for (var k = 0, v = chordsInCurrentBar.length; k < v; k++) {
									if (typeof chordsInCurrentBar[k + 1] !== "undefined" && (chordsInCurrentBar[k].getBeat() === chordsInCurrentBar[k + 1].getBeat())) {
										txt += chordsInCurrentBar[k].toString('') + '_';
									} else {
										txt += chordsInCurrentBar[k].toString('') + ' ';
									}
									if (this.delimiterBeat !== "") {
										cm = this.songModel.getComponent('chords');
										chordDuration = cm.getChordDuration(this.songModel, cm.getChordIndex(chordsInCurrentBar[k]));
										chordDuration = Math.floor(chordDuration);
										for (var l = 0; l < chordDuration - 1; l++) {
											txt += this.delimiterBeat + ' ';
										}
									}
								}
							}
							if (typeof currentBar.ending !== "undefined" && (currentBar.ending === 'END' || currentBar.ending === 'BEGIN_END')) {
								txt += ':';
							}
						}
					}
					txt += this.delimiterNewLine;
				}
			}
			this.el.innerHTML = txt;
		};



		SongView_chordSequence.prototype.getSectionView = function(sectionNumber) {
			var txt = '';
			if (this.displaySection === true) {
				if (typeof this.songModel.getSection(sectionNumber) !== "undefined") {
					var section = this.songModel.getSection(sectionNumber);
					txt += /*'section: ' + */ section.getName();
					if (section.getRepeatTimes() > 0) {
						var playedTimes = parseInt(section.getRepeatTimes(), 10) + 1;
						txt += ' (' + playedTimes + ')';
					}
					// txt += this.delimiterNewLine;
					txt += ': ';
				}
			}
			return txt;
		};


		return SongView_chordSequence;
	});