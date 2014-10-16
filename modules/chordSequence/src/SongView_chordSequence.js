define(['modules/core/src/SongModel', 'modules/core/src/SectionModel', 'modules/core/src/BarManager', 'modules/core/src/BarModel', 'modules/core/src/ChordManager', 'modules/core/src/ChordModel'],
	function(SongModel, SectionModel, BarManager, BarModel, ChordManager, ChordModel) {
		function SongView_chordSequence(songModel, option) {
			// songModel
			this.songModel = (typeof songModel !== "undefined" && songModel instanceof SongModel) ? songModel : undefined;

			//TODO unfoldSong is not working yet

			// display general option
			this.displayTitle = (typeof option !== "undefined" && typeof option.displayTitle !== "undefined") ? option.displayTitle : true;
			this.displayComposer = (typeof option !== "undefined" && typeof option.displayComposer !== "undefined") ? option.displayComposer : true;
			this.displayBar = (typeof option !== "undefined" && typeof option.displayBar !== "undefined") ? option.displayBar : true;
			this.delimiterBar = (typeof option !== "undefined" && typeof option.delimiterBar !== "undefined") ? option.delimiterBar : "|";
			this.displaySection = (typeof option !== "undefined" && typeof option.displaySection !== "undefined") ? option.displaySection : true;
			this.unfoldSong = (typeof option !== "undefined" && typeof option.unfoldSong !== "undefined") ? option.unfoldSong : false;
			this.fillEmptyBar = (typeof option !== "undefined" && typeof option.fillEmptyBar !== "undefined") ? option.fillEmptyBar : true;
			this.fillEmptyBarCharacter = (typeof option !== "undefined" && typeof option.fillEmptyBarCharacter !== "undefined") ? option.fillEmptyBarCharacter : "%";
		};

		SongView_chordSequence.prototype.display = function() {
			var txt = '';
			if (typeof this.songModel !== "undefined") {
				if (this.displayTitle === true) {
					txt += this.songModel.getTitle() + ' ';
				}
				if (this.displayComposer === true) {
					txt += '(' + this.songModel.getComposer() + ')';
				}
				if (this.displayTitle === true || this.displayComposer === true) {
					txt += '\n';
				}
				var sectionsLength = this.songModel.getSections().length;
				for (var i = 0; i < sectionsLength; i++) {
					txt += this.getSectionView(i);
					if (this.displayBar === true) {
						var sections = this.songModel.getUnfoldedSongSection(i);

						var currentBarNumber = 0;
						var currentBar;
						for (var j = 0; j < sections.length; j++) {
							currentBarNumber = sections[j];
							currentBar = this.songModel.getBar(currentBarNumber);
							if (j !== 0) {
								txt += this.delimiterBar;
							}
							if (typeof currentBar.ending !== "undefined" && (currentBar.ending === 'BEGIN' || currentBar.ending === 'BEGIN_END')) {
								txt += ':'
							}
							if (j !== 0) {
								txt += ' '
							}
							var chordsInCurrentBar = this.songModel.getComponentsAtBarNumber(currentBarNumber, 'chords');
							if (chordsInCurrentBar.length == 0 && this.fillEmptyBar === true) {
								txt += this.fillEmptyBarCharacter;
							} else {
								for (var v = 0; v < chordsInCurrentBar.length; v++) {
									txt += chordsInCurrentBar[v].toString('');
								}
							}
							txt += ' ';
							if (typeof currentBar.ending !== "undefined" && (currentBar.ending === 'END' || currentBar.ending === 'BEGIN_END')) {
								txt += ':'
							}
						}
					}
				}
			}
			return txt;
		}



		SongView_chordSequence.prototype.getSectionView = function(sectionNumber) {
			var txt = '';
			if (this.displaySection === true) {
				if (typeof this.songModel.getSection(sectionNumber) !== "undefined") {
					var section = this.songModel.getSection(sectionNumber);
					txt += 'section: ' + section.getName();
					if (section.getRepeatTimes() > 0) {
						txt += ' (' + section.getRepeatTimes() + ')';
					}
					txt += '\n';
				}
			}
			return txt;
		}


		return SongView_chordSequence;
	});