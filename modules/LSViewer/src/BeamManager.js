define(['vexflow', 
		'modules/LSViewer/src/LSNoteView',
		'utils/NoteUtils',
		'underscore'
		], function(Vex, LSNoteView, NoteUtils,_) {
	/**
    * 
    * @exports LSViewer/BeamManager
    */
	function BeamManager() {
		this.beams = []; //array of arrays of vexflow notes, each array of vxfNotes represents a beam group
		this.counter = 0;
		this.lastNoteBeat = -1;
	}
	/**
	 * 
	 * @param  {Array} barNotes     array of NoteModel bar notes
	 * @param  {Number} beatBeamUnit represents the beatUnit to group beams, it will be 1 always except for 6/7, 9/6 and 12/8 for whom it will be 1.5
	 * @return {Array}  of beams represented by [startIndex, endIndex] e.g. [ [0,4], [5,9]]. Index of notes that are to beam together because they are on the same beam beat unit
	 */
	BeamManager.prototype._getBeatBeamIndexes = function(barNotes, beatBeamUnit) {
		/**
		 * @param  {Number} beat1        
		 * @param  {Number} beat2        
		 * @param  {Number} beamBeatUnit (normally 1 or 1.5)
		 * @return {Boolean}     
		 */
		function inSameBeatUnit(beat1, beat2, beamBeatUnit){
			return Math.floor(beat1 / beatBeamUnit) === Math.floor(beat2 / beatBeamUnit);
		}
		/**
		 * @param  {Array} startBeams e.g  start beams indexes, e.g. [0, 2, 4, 6] meaning theat beams start at those note indexes
		 * @param  {Number} totalNotes e.g 10
		 * @return {Array}  of [start, end] indexes, e.g. [[0,1],[2,3],[4,5],[6, 9]]
		 */
		function getBeamsFromStartBeams(startBeams, totalNotes){
			var beams = [],
			 	endBeam;
			for (var i = 0; i < startBeams.length; i++) {
				endBeam = i + 1 === startBeams.length ? totalNotes - 1 : startBeams[i + 1] - 1;
				if (i !== endBeam){ //we avoid beams that have only one  note
					beams.push([startBeams[i], endBeam]);	
				}
			}
			return beams;
		}

		var accumDur = 0, //accumulated duration
			lastDur = -1,
			startBeams = [];
		for (var i = 0; i < barNotes.length; i++) {
	
			if (!inSameBeatUnit(NoteUtils.roundBeat(accumDur), NoteUtils.roundBeat(lastDur), beatBeamUnit)){
				startBeams.push(i);
			}
			lastDur = accumDur;
			accumDur += barNotes[i].getDuration();
		}
		return getBeamsFromStartBeams(startBeams, barNotes.length); //we return that string converted to 
	};

	/**
	 * tuplets should be beamed together, as well as notes in same beats, this function merges beaming groups
	 * @param  {Array} tuplets array of [startTupletIndex, endTupletIndex] 
	 * @param  {Array} beams   array of same pair of values, but for beams
	 * @return {Array}         merged array of pairs of values
	 */
	BeamManager.prototype._mergeBeamIndexes = function(tuplets,beams) {
		/**
		 * @param  {Array} beams  of [startIndex, endIndex]
		 * @param  {Array} tuplet of [startIndex, endIndex]
		 * @return {Array} containing index of first and last beams that tuplet comprises
		 */
		function getComprisingBeamsIndexes(beams, tuplet){
			var idx = [];
			var i = 0;
			_.each(beams, function(beam){
				if (tuplet[0] >= beam[0] && tuplet[0] <= beam[1] || 
					tuplet[1] >= beam[0] && tuplet[1] <= beam[1] ){
					idx.push(i);
				}
				i++;
			});
			return [idx[0], idx[idx.length - 1]];
		}

		var comprBeamsIdx, firstBeam, decal;
		_.each(tuplets, function(tuplet){
			comprBeamsIdx = getComprisingBeamsIndexes(beams, tuplet); //returns  indexes e.g: [1,3]
			if (comprBeamsIdx[0] !== comprBeamsIdx[1]){ //if more than one beam
				//tuplet will overwrite containing beams or break them into two
				//first beam:
				firstBeam = beams[comprBeamsIdx[0]];
				//if they start at same place, we just set the end
				if (firstBeam[0] === tuplet[0]){
					firstBeam[1] = tuplet[1];
					decal = 0;
				}
				else{
					//we make beam last until tuplet starts, and create a new beam from tuplet end and add the whole tuplet space
					firstBeam[1] = tuplet[0] - 1;
					beams.splice(comprBeamsIdx[0] + 1, 0, tuplet);
					decal = 1; //we have to decal indexes by 1 as we added 1 position
				}
				//we set to [-1, -1] all beams that will be later deleted 
				for (var i = comprBeamsIdx[0] + 1 + decal; i <= comprBeamsIdx[1] + decal; i++) {
					// we will delete all beams covered competely by tuplet
					if (beams[i][1] <= tuplet[1]){
						beams[i] = [-1,-1];
					}else{
						//and if there is a remaining one, we just make it start whe tuplet finishes
						beams[i][0] = tuplet[1] + 1;
					}
				}
			}
		});
		//here we actually delete beams with only one note
		var i = beams.length;
		while( i--) {
			if (beams[i][0] === beams[i][1]){
				beams.splice(i,1);
			}
		}
		return beams;
	};
	/**
	 * @param  {Array} barNotes array of NoteModels
	 * @return {Array} of numbers representing the index of non beamable notes
	 */
	BeamManager.prototype._getNonBeamableIndexNotes = function(barNotes) {
		function isNotBeamable(note){
			return isNaN(note.duration) || note.isRest; //durations are "w", "h","q", "8","16","32" we know durations represented by numbers are beamable (i.e. 8th note or shorter)
		}
		var idx = [];
		var i = 0;
		_.each(barNotes, function(barNote){
			if (isNotBeamable(barNote)){
				idx.push(i);
			}
			i++;
		});
		return idx;
	};
	/**
	 * We have groups of notes that are to beam together, but if a not is not beamable, we have to separate those groups accordingly. 
	 * All groups must have more than one note, because it makes no sense to beam only one note. (an examples is in the tests)
	 * 
	 * @param  {Array} beams      array of beams, which are pairs of values [startIndex, endIndex]. e.g.: [ [0,2] , [3, 5] ]
	 * @param  {Array} cutIndexes array of indexes where to cut beams
	 * @return {Array}            array of transformed beans
	 */
	BeamManager.prototype._cutBeamsByIndex = function(beams, cutIndexes) {
		function inBeam(beam, idx){
			return idx >= beam[0] && idx <= beam[1];
		}
		var beam, beamEnd;
		var newBeam = [];
		_.each(cutIndexes, function(idx){
			for (var i = 0; i < beams.length; i++) {
				beam = beams[i];

				if (inBeam(beam, idx)){
					//case [n, n + 1] //one note remaining -> no beams (we remove beam)
					if (beam[1] - beam[0] < 2){ 
						beams.splice(i, 1);
						i--;
					}else{
						// case [n, n + 2] and idx == n + 1 //one note remaining -> no beams (we remove beam)
						if (idx === beam[0] + 1 && idx === beam[1] - 1){ 
	 						beams.splice(i, 1);
							i--;
						} 
						// e.g beam [6, 9] and idx = 6 (or 7) -> turns into [7,8,9] (or [8,9])
						else if (idx <= beam[0] + 1){
							beam[0] = idx + 1;
						}
						// e.g beam [6, 9] and idx = 9 (or 8) -> turns into [6,7,8] (or [6,7])
						else if (idx >= beam[1] - 1){
							beam[1] = idx - 1;
						}
						//case where idx cuts beam and there are more than one note in both parts
						else{
							beamEnd = beam[1];
							beam[1] = idx - 1;
							newBeam = [idx + 1, beamEnd];
							beams.splice(i + 1, 0, newBeam);
							i++;
						}
					}
					//each idx is only in one beam
					break;
				}
			}		
		});
		return beams;
	};
	/**
	 * calculates beaming taking into account all cases, just making them ready to be drown
	 * @param  {Array} barNotes  array of NoteModels
	 * @param  {TupletManager tupletMng 
	 * @param  {SongIterator} songIt    
	 * @return {Array}        array of [start, end] indexes of beams e.g [[0,4] , [5,7]]
	 */
	BeamManager.prototype.getBeamIndexes = function(barNotes, tupletMng,  songIt) {
		function timeSigBeamingUnit(timeSig){
			//returns 1 for all time signatures except for 3/8, 6/8. 9/8, 12/8 
			return timeSig.beatUnit === 8 && timeSig.getBeats() % 3 === 0 ? 1.5 : 1;
		}

		var beatBeams = this._getBeatBeamIndexes(barNotes, timeSigBeamingUnit(songIt.getBarTimeSignature()));
		beatBeams = this._mergeBeamIndexes(tupletMng.tuplets, beatBeams);
		var idxNonBeamableNotes = this._getNonBeamableIndexNotes(barNotes);
		return this._cutBeamsByIndex(beatBeams, idxNonBeamableNotes);
	};
	/**
	 * sets this.beams to and array of array of vxfNotes, vxfNotes of same array will be beamed together
	 * @param {Array} beamIndexes of [start, end] 
	 * @param {Array} vxfNotes    [description]
	 */
	BeamManager.prototype.setBeams = function(beamIndexes, vxfNotes) {
		var self = this;
		_.each(beamIndexes, function(beamIndex){
			var arrBeamNotes = [];
			for (var i = beamIndex[0]; i <= beamIndex[1] ; i++) {
				arrBeamNotes.push(vxfNotes[i].getVexflowNote());
			}
			self.beams.push(arrBeamNotes);
		});
	};

	/**
	 * 	@return {Array} Array of Vex.Flow.Beam (generate from information in array this.beams) needed to draw
	 */
	BeamManager.prototype.getVexflowBeams = function() {
		var vexflowBeams = [];
		for (var j = 0; j < this.beams.length; j++) {
			if (this.beams[j] && this.beams[j].length > 1)
				vexflowBeams[j] = new Vex.Flow.Beam(this.beams[j], true); //auto_stem true
			else vexflowBeams[j] = null;
		}
		return vexflowBeams;
	};

	/**
	 * 	draws beams
	 * @param  {Context} ctx
	 * @param  {Array} vxfBeams  Array of Vex.Flow.Beam
	 */
	BeamManager.prototype.draw = function(ctx, vxfBeams) {
		for (var j = 0, c = vxfBeams.length; j < c; j++) {
			if (vxfBeams[j] !== null) vxfBeams[j].setContext(ctx).draw();
		}
	};

	return BeamManager;
});