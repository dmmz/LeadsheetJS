define(function(){
	/**
	 * [Interval description]
	 * @param {Number} type      e.g. 1 for unison, 2 for second (regardless of if it is augmented, diminished...etc.)
	 * @param {Number} semitones semitones from natural C
	 * @param {String} name      
	 */
	function Interval(type, semitones, name){
		this.type = type;
		this.semitones = semitones;
		this.name = name;
	};

	var Intervals = {};
 	Intervals.unison                  = new Interval(1,  0, "unison");
	Intervals.augmentedUnison         = new Interval(1,  1, "augmented unison");
	Intervals.superAugmentedUnison    = new Interval(1,  2, "super augmented unison");
	Intervals.diminshedUnison         = new Interval(1, -1, "diminished unison");
	Intervals.superDiminishedUnison   = new Interval(1, -2, "super diminished unison");
	Intervals.minorSecond             = new Interval(2, 1, "minor second");
	Intervals.majorSecond             = new Interval(2, 2, "major second");
	Intervals.augmentedSecond         = new Interval(2, 3, "augmented second");
	Intervals.minorThird              = new Interval(3, 3, "minor third");
	Intervals.majorThird              = new Interval(3, 4, "major third");
	Intervals.perfectFourth           = new Interval(4, 5, "perfect fourth");
	Intervals.diminishedFourth        = new Interval(4, 4, "diminished fourth");
	Intervals.augmentedFourth         = new Interval(4, 6, "augmented fourth");
	Intervals.perfectFifth            = new Interval(5, 7, "perfect fifth");
	Intervals.diminishedFifth         = new Interval(5, 6, "diminished fifth");
	Intervals.augmentedFifth          = new Interval(5, 8, "augmented fifth");
	Intervals.minorSixth              = new Interval(6, 8, "minor sixth");
	Intervals.majorSixth              = new Interval(6, 9, "major sixth");
	Intervals.augmentedSixth          = new Interval(6, 10, "augmented sixth");
	Intervals.minorSeventh            = new Interval(7, 10, "minor seventh");
	Intervals.majorSeventh            = new Interval(7, 11, "major seventh");
	Intervals.diminishedSeventh       = new Interval(7, 9, "diminished seventh");
	Intervals.octave                  = new Interval(8, 12, "octave");
	Intervals.augmentedOctave         = new Interval(8, 13, "augmented octave");
	Intervals.diminishedOctave        = new Interval(8, 11, "diminished octave");
	Intervals.minorNinth              = new Interval(9, 13, "minor ninth");
	Intervals.majorNinth              = new Interval(9, 14, "major ninth");
	Intervals.augmentedNinth          = new Interval(9, 15, "augmented ninth");

	return Intervals;
})