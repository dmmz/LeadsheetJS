define(['modules/core/src/SongBarsIterator', 'modules/core/src/SectionBarsIterator'], function(SongBarsIterator, SectionBarsIterator) {
	/**
    * 
    * @exports LSViewer/BarWidthManager
    */
	function BarWidthManager(lineHeight, lineWidth, noteWidth, barsPerLine, marginTop, lastBarWidthRatio) {
		if (lineHeight === undefined) throw "BarWidthManager - lineHeight not defined";
		if (lineWidth === undefined) throw "BarWidthManager - lineWidth not defined";
		if (noteWidth === undefined) throw "BarWidthManager - noteWidth not defined";
		if (barsPerLine === undefined) throw "BarWidthManager - barsPerLine not defined";
		if (marginTop === undefined) throw "BarWidthManager - marginTop not defined";

		this.lastBarWidthRatio = lastBarWidthRatio || 1;

		this.WIDTH_FACTOR = 1.6; // factor by which we multiply the minimum width so that notes are not so crammed (always > 1)
		this.barsStruct = [];

		this.lineHeight = Number(lineHeight);
		this.lineWidth = Number(lineWidth);
		this.noteWidth = Number(noteWidth);
		this.barsPerLine = Number(barsPerLine);
		this.marginTop = Number(marginTop);
	}
	/**
	 * calculates the minimum width for each bar depending on the number of notes it has
	 * @param  {SongModel} song
	 * @param  {NoteManagerModel} noteMng
	 * @param  {CanvasContext} ctx
	 * @param  {String} font chords. ex: "18px verdana"
	 *
	 * last two params are needed if we are drawing chord symbols
	 * @return {Array} of minimum widths    e.g.: [200,200,100,100,100,200,]
	 */
	BarWidthManager.prototype.getMinWidthList = function(song, noteMng, chordsMng, ctx, fontChord) {
		var self = this,
			width,
			minWidthList = [],
			barNotes,
			barChords,
			sectionIt,
			chordWidth,
			diff,
			maxDiff,
			chord,
			marginChordFactor = 1.15; //always should be greater than 1
		var oldCtxFont = ctx.font;

		ctx.font = fontChord;
		var songIt = new SongBarsIterator(song);

		song.getSections().forEach(function(section) {
			sectionIt = new SectionBarsIterator(section);
			while (sectionIt.hasNext()) {
				//get minimum notes width
				barNotes = noteMng.getNotesAtCurrentBar(songIt);
				width = (barNotes.length * self.noteWidth) * self.WIDTH_FACTOR;

				//get minimum chords width. strategy: we check if any chords of bar are longer than the space assigned for them, 
				//if there are one or more, we get the longest difference and we widen ALL beats (this way we keep consistency between chord duration and chord space)
				chordWidth = width / songIt.getBarTimeSignature().getBeats();

				barChords = chordsMng.getChordsByBarNumber(songIt.getBarIndex());
				maxDiff = 0;
				for (var i = 0; i < barChords.length; i++) {
					chord = barChords[i];
					//if chord is in last beat of measure or there is only one beat difference between next 
					if (chord.getBeat() == barChords.length - 1 || (i < barChords.length - 1 && chord.getBeat() == barChords[i + 1].getBeat() - 1)) {
						//we check if should be longer
						diff = ctx.measureText(chord.toString()).width - chordWidth;
						if (diff > 0 && diff > maxDiff) {
							maxDiff = diff;
						}
					}
				}
				if (maxDiff !== 0) {
					//here we widen ALL beats a maxDiff
					width += maxDiff * marginChordFactor * songIt.getBarTimeSignature().getBeats();
				}
				minWidthList.push(width);
				songIt.next();
				sectionIt.next();
			}

		});
		ctx.fond = oldCtxFont;

		return minWidthList;
	};


	/**
	 * decides which bars go into which line depending on the width, constraints are: can't be wider than lineWidth
	 * @param  {Array} minWidthList  minimum width for each bar. e.g.: [200,200,500,500, 300,100,100,100]
	 * @return {Array}	Array 2-dimensions, matrix in which each line represents a line on the score,
	 * and the width for each bar fitting in the line. e.g. (being the line width 1160) [	[200,200,500],		( sum of widths is < 1160)
	 *																						[500,300,100,100,100]	(< 1160)
	 */
	BarWidthManager.prototype.assignBarsToLines = function(minWidthList, pickupAtStart) {

		/**
		 * @param  {Array} bars
		 * @param  {Integer} to   0 based index
		 * @return {Integer}
		 */
		function calculateWidth(bars, to) {
			var totalWidth = 0;
			for (var i = 0; i <= to; i++) {
				totalWidth += bars[i];
			}
			return totalWidth;
		}

		var numBarsProcessed = 0,
			lineMinWidths;
		var widthsByLine = [],
			lineWidthList,
			barWidth = this.lineWidth / this.barsPerLine,
			i,
			barsToGet,
			numCarriedBars = 0,
			numCurrLastBar;

		while (numBarsProcessed < minWidthList.length || numCarriedBars !== 0) {
			lineWidthList = [];
			barsToGet = this.barsPerLine + numCarriedBars;
			if (pickupAtStart && numBarsProcessed === 0) {
				barsToGet++;
			}

			numCurrLastBar = numBarsProcessed + barsToGet;

			lineMinWidths = minWidthList.slice(numBarsProcessed, numBarsProcessed + barsToGet);
			numCarriedBars = 0;

			var lastBarIncluded = lineMinWidths.length - 1;
			var exceedsTotal = true;
			while (exceedsTotal && lastBarIncluded >= 0) {
				// we check every time if all widths fit in line	
				if (calculateWidth(lineMinWidths, lastBarIncluded) < this.lineWidth) {
					// if they fit, we save them in lineWidthList
					exceedsTotal = false;
					for (i = 0; i <= lastBarIncluded; i++) lineWidthList[i] = lineMinWidths[i];
				} else {
					//if not, we take out iteratively last one and put as carry for the next line 
					if (lastBarIncluded > 0) {
						numCarriedBars++;
						lineMinWidths.pop();
						lastBarIncluded--;
					} else {
						// except if there are no widths left to take out. In that case it means that one width is already higher than lineWidth, 
						// in this case we save it as lineWidth (we'll may see crammed bar notes, but we can't make lines wider than linWidth,  this is an exceptional case)
						lineWidthList.push(this.lineWidth);
						exceedsTotal = false;
					}
				}
			}
			widthsByLine.push(lineWidthList);
			numBarsProcessed += lineMinWidths.length;
		}
		return widthsByLine;
	};
	/**
	 * Gets the final widths by recalculating them depending on whether there are bars which are too wide, and making flexible the rest of bars
	 * @param  {Array} minWidthsPerLine  [	[200,200,500],		( sum of widths is < 1160)
	 *                                   [500,300,100,100,100]	(< 1160)
	 *                                    ]
	 *																					]
	 * @return {Array}                 array (2-dimensions) with final widths that will be used to draw
	 */
	BarWidthManager.prototype.getWidths = function(minWidthsPerLine) {

		/**
		 * [getIndexOfWidthsExceedingMean description]
		 * @param  {Array} lineWidthList list of widths in one line
		 * @param  {Number} meanWidth
		 * @return {Array}               indexes of widths that exceede the meanWidth
		 */
		function getIndexOfWidthsExceedingMean(lineWidthList, meanWidth) {
			var indexes = [];
			for (var i = 0; i < lineWidthList.length; i++) {
				if (lineWidthList[i] > meanWidth) indexes.push(i);
			}
			return indexes;
		}
		/**
		 * @param  {Integer} lengthArray
		 * @return {Array}
		 */
		function createZeroArray(lengthArray) {
			var zeroArray = [];
			for (var i = 0; i < lengthArray; i++) {
				zeroArray[i] = 0;
			}
			return zeroArray;
		}

		/**
		 * sets the widths on the line depending on the minimum widths (central part of getWidths)
		 * @param {Array} minLineWidthList , array of one dimension representing the withs of one line
		 * @param {Integer} lineWidth
		 */
		function setLineWidthList(minLineWidthList, lineWidth) {
			var numWidths = minLineWidthList.length; // number of widths (i.e. of bars)  this line has
			var lineWidthList = createZeroArray(numWidths); //list of widths to return, initialized to 0

			var meanWidth = lineWidth / minLineWidthList.length; // if everything normal (no too wide bars), all bars should have meanWidth
			var indexes = getIndexOfWidthsExceedingMean(minLineWidthList, meanWidth); // we get indexes of bars that are too wide

			// in bars which are too wide, we set the original value, we also calculate the total with the wide bars take
			var takenWidth = 0;
			for (var i = 0; i < indexes.length; i++) {
				lineWidthList[indexes[i]] = minLineWidthList[indexes[i]];
				takenWidth += minLineWidthList[indexes[i]];
			}

			var numWidthsLessMean = numWidths - indexes.length; // number of bars that are not too wide
			var totalWidthLessMean = lineWidth - takenWidth; //  total remaining width

			//all bars that are not too wide will have same standard width
			var standardWidth = Math.round(totalWidthLessMean / numWidthsLessMean * 1000) / 1000;

			// we set the standard width to bars that are not too wide
			for (i = 0; i < lineWidthList.length; i++) {
				if (lineWidthList[i] === 0)
					lineWidthList[i] = standardWidth;
			}
			return lineWidthList;
		}

		var finalWidths = [],
			lineFinalWidths;

		for (var i = 0; i < minWidthsPerLine.length; i++) {
			lineFinalWidths = setLineWidthList(minWidthsPerLine[i], this.lineWidth);
			finalWidths.push(lineFinalWidths);
		}

		//we shorten last bar by lastBarWidthRatio
		var lastRow = finalWidths.length - 1,
			lastColumn = finalWidths[lastRow].length - 1;
		finalWidths[lastRow][lastColumn] *= this.lastBarWidthRatio;
		return finalWidths;
	};
	BarWidthManager.prototype.setBarsStruct = function(barsStruct) {
		this.barsStruct = barsStruct;
	};
	/**
	 * Decides which bar goes into which line depending on its width, and sets the final width depending on the distribution of bars among lines
	 * @param {SongMoel} song
	 * @param {NoteManagerModel} noteMng [description]
	 */

	BarWidthManager.prototype.calculateBarsStructure = function(song, noteMng, chordsMng, ctx, fontChords) {
		var minWidthList = this.getMinWidthList(song, noteMng, chordsMng, ctx, fontChords);
		var pickupAtStart;
		if (typeof song.getSection(0) !== "undefined") {
			pickupAtStart = song.getSection(0).getNumberOfBars() == 1;
		}
		var minWidthPerLineList = this.assignBarsToLines(minWidthList, pickupAtStart);
		this.setBarsStruct(this.getWidths(minWidthPerLineList));
	};



	/**
	 * returns top,left and width of a given bar. Used when drawing
	 * @param  {Integer} numBar
	 * @return {Object} {
	 *						top: topValue,
	 *						left: leftValue,
	 *						width: widthValue
	 *					}
	 */
	BarWidthManager.prototype.getDimensions = function(numBar) {
		var i, j,
			currentNumBar = 0,
			currentLine = 0,
			left = 0;
		for (i = 0; i < this.barsStruct.length; i++) {
			for (j = 0; j < this.barsStruct[i].length; j++) {
				if (currentNumBar == numBar) {
					return {
						left: left,
						width: this.barsStruct[i][j],
						top: currentLine * this.lineHeight + this.marginTop,
						height: this.lineHeight
					};
				}
				currentNumBar++;
				left += this.barsStruct[i][j];
			}
			left = 0;
			currentLine++;
		}
	};

	BarWidthManager.prototype.inSameLine = function(iBar1, iBar2) {
		var numBar = 0,
			line1 = -1,
			line2 = -1;
		labelMainFor: for (var line = 0; line < this.barsStruct.length; line++) {
			for (var j = 0; j < this.barsStruct[line].length; j++) {
				if (numBar == iBar1) line1 = line;
				if (numBar == iBar2) line2 = line;
				if (line1 != -1 && line2 != -1) break labelMainFor;
				numBar++;
			}
		}
		return line1 == line2;

	};
	return BarWidthManager;
});