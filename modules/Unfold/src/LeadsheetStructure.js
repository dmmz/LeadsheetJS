define([
	'modules/Unfold/src/PointLabel',
	'modules/Unfold/src/StartLabel',
	'modules/Unfold/src/EndLabel',
	'modules/Unfold/src/CodaToLabel',
	'modules/Unfold/src/StartPoint',
	'modules/Unfold/src/EndPoint',
	'modules/Unfold/src/SectionEndPoint',
	'modules/Unfold/src/SectionStartPoint',
	'modules/Unfold/src/SectionRepetition',
	'modules/Unfold/src/DaAlRepetition',
	'modules/Unfold/src/SectionRepetitionFactory',
	'modules/Unfold/src/LeadsheetUnfoldConfig',
], function(PointLabel, StartLabel, EndLabel, CodaToLabel, StartPoint, EndPoint, SectionEndPoint, SectionStartPoint, SectionRepetition, DaAlRepetition, SectionRepetitionFactory, LeadsheetUnfoldConfig) {

	var LeadsheetStructure = function(song) {
		var self = this;
		var startLabels = new Map();
		var endLabels = new Map();
		var sectionStartPoints = {};
		var sectionEndPoints = new Map();
		var repetitions = [];

		var lastSectionEndPoint = null;

		this.leadsheet = song;
		this.sections = song.getSections();

		function hasStartLabel(label) {
			return startLabels.has(label);
		}
		var hasEndLabel = function(label){
			return endLabels.has(label);
		};

		var createStartLabel = function(label, sectionNumber, barNumber) {
			if (hasStartLabel(label)) {
				return;
			}
			///TODO: playIndex
			var playIndex = self.sections[sectionNumber].getPlayIndexOfBar(barNumber);
			var startPoint = Object.create(StartPoint);
			startPoint.initValues(self, label, sectionNumber, barNumber, playIndex);
		};

		var createEndLabel = function(label, sectionNumber, barNumber){
			if  (hasEndLabel(label)){
				return;
			}
			var playIndex = self.sections[sectionNumber].getPlayIndexOfBar(barNumber);
			var endPoint;
			if (EndLabel.TOCODAS.indexOf(label) !== -1) {
				endPoint = Object.create(ToCodaPoint);
				endPoint.callInitValues(self, label, sectionNumber, barNumber, playIndex);
			}else{
				endPoint = Object.create(EndPoint);
				endPoint.initValues(self, label, sectionNumber, barNumber, playIndex);
			}
			
			
		};

		var addDaAlRepetition = function(sublabel, sectionNumber, barNumber) { 
			var playIndex = self.sections[sectionNumber].getPlayIndexOfBar(barNumber);
			var daAlRepetition = Object.create(DaAlRepetition);
			daAlRepetition.initValues(self, sublabel, sectionNumber, barNumber, playIndex);
			addRepetition(daAlRepetition);
		};
		var getRepetitions = function() {
			return this.repetitions;
		};
		this.getSection = function(i) {
			return this.sections[i];
		};

		this.addStartLabel = function(point) {
			startLabels.set(point.getLabel(), point);
		};

		this.addEndLabel = function(point) {
			endLabels.set(point.getLabel(), point);
		};

		this.getStartLabels = function() {
			return startLabels;
		};

		this.getEndLabels = function() {
			return endLabels;
		};

		this.getStartLabel = function(label) {
			if (!startLabels.has(label)) {
				console.warn("missing label " + label );
			}
			return startLabels.get(label);
		};

		this.getSectionPoints = function() {
			return sectionPoints;
		};

		this.getSectionStartPoint = function(iSection) {
			return sectionStartPoints[iSection];
		};
		this.getSectionLastEndPoint = function(iSection, playIndex) {
			return sectionEndPoints.get({
				section: iSection,
				playIndex: playIndex
			});
		};

		var addSectionPlayPoints = function(section, iSection, playIndex) {
			var sectionEndPoint = Object.create(SectionEndPoint);
			sectionEndPoint.callInitValues(self, iSection, playIndex);
			sectionEndPoints.set({
				section: iSection,
				playIndex: playIndex
			}, sectionEndPoint);
			lastSectionEndPoint = sectionEndPoint;
		};
		var hasRepetitionUntil = function(point) {
			for (var i = 0; i < repetitions.length; i++) {
				if (repetitions[i].getUntilPoint() === point)
					return true;
			}
			return false;
		};
		var addCoda = function(label, sectionNumber, barNumber){
			if (hasEndLabel(label)){
				// Second coda sign
				// Returns false if both coda signs are already found
				// EndPoint toCodaPoint = getEndLabel(label);
				return addCodaTo(ToCodaLabel.getCodaToLabel(label), sectionNumber, barNumber);
			}else{
				createEndLabel(label, sectionNumber, barNumber);
				return true;
			}
		};

		var addCodaTo = function(toLabel, sectionNumber, barNumber){
			var toCodaPoint;
			var toCodaLabel = CodaToLabel.getToCodaLabel(toLabel);
			if (hasEndLabel(toCodaLabel)) {
				toCodaPoint = endLabels.get(toCodaLabel);
			} else if (toCodaLabel == EndLabel.TOCODA2){

				if(!hasEndLabel(EndLabel.TOCODA)){
					return false;
				}
				//NO ENTIENDO 
				toCoda1Point = EndLabel.get(EndLabel.TOCODA);
				toCodaPoint = createEndLabel(toCodaLabel, toCoda1Point.section, toCoda1Point.bar);
			}
			if (!toCodaPoint) {
				return false;
			}
			createStartLabel(toLabel, sectionNumber, barNumber);
			if (!hasRepetitionUntil(toCodaPoint)) {
				addDaAlRepetition("DC al Coda", sectionNumber, barNumber);
			}
		};

		var addRepetition = function(repetition) {
			repetitions.push(repetition);
		};

		var initSection = function(iSection) {
			var section = self.sections[iSection];

			var sectionStartPoint = Object.create(SectionStartPoint);
			sectionStartPoint.callInitValues(self, iSection);
			sectionStartPoints[iSection] = sectionStartPoint;

			var numPlays = section.hasOpenRepeats() ? 1 : section.getNumTimesToPlay();

			for (var playIndex = 0; playIndex < numPlays; playIndex++) {
				addSectionPlayPoints(section, iSection, playIndex);
			}
			if (section.hasOpenRepeats()) {
				addRepetition(SectionRepetitionFactory.get(self, iSection, 0));
			} else {
				for (playIndex = 0; playIndex < numPlays - 1; playIndex++) {
					addRepetition(SectionRepetitionFactory.get(self, iSection, playIndex));
				}
			}
		};

		this.init = function() {
			if (self.sections.length === 0) {
				return;
			}
			createStartLabel(StartLabel.CAPO, 0, 0);
			var section;
			for (var iSection = 0; iSection < this.sections.length; iSection++) {
				section  = self.sections[iSection];
				initSection(iSection);

				//looking for codas
				if (section.isNamedCoda()){
					addCodaTo(StartLabel.CODATO, iSection, 1);
				}else if (section.isNamedCoda2()){
					addCodaTo(StartLabel.CODA2TO, iSection, 1);
				}else{
					var coda;
					var codaLabels = PointLabel.getToCodaLabels();
					for (var i = 0; i < codaLabels.length; i++) { 
						coda = codaLabels[i];
						if(section.hasLabel(coda.name)){
							addCoda(coda, iSection, section.getLabel(coda.name));
						}
					}
				}

				//looking for solo labels (segno, segno2 and fine)
				//TODO
				var sublabels = section.getSublabels();
				for (var keySublabel in sublabels){
					addDaAlRepetition(keySublabel, iSection, sublabels[keySublabel]);
				}
			}
			createEndLabel(EndLabel.END, lastSectionEndPoint.section,
				lastSectionEndPoint.bar);
		};
		this.getUnfoldConfig = function() {
			return LeadsheetUnfoldConfig;
		};
		this.addSegmentsToList = function(list, cursor, toPoint) {
			var fromPoint = cursor.point;
			if (!fromPoint || !toPoint ||  toPoint.isBefore()
				/* || !toPoint.isPositionComplete() || !fromPoint.isPositionComplete() */
				){
				throw "invalid segment ";
			}
			for (var iSection = fromPoint.section; iSection < toPoint.section; iSection++) {
				var segmentFrom = iSection === fromPoint.section ? fromPoint : this.getSectionStartPoint(iSection);
				var segmentTo = iSection === toPoint.section ? toPoint : this.getSectionLastEndPoint(iSection);
				var playIndex = iSection === fromPoint.section && iSection === toPoint.section ? cursor.playIndex : segmentTo.playIndex;
				list.push(new SectionSegment(this, segmentFrom, segmentTo, playIndex));
			}
			return list;
		};
		this.getSegments = function(unfoldConfig) {
			var segments = [];

			if (this.sections.length === 0){
				return segments;
			}
			var repHolder = Object.create(RepetitionHolder);
			repHolder.init(this);
			var cursor = {
				point: getStartLabel(StartLabel.CAPO),
				playIndex: 0
			};
			var targetsStack = [];

			var leadsheetTarget = {
				point: getEndLabel(EndLabel.END)
				//, repetition: null
			};
			targetsStack.push(leadsheetTarget);
			var nextTarget, nextRepetition;
			while (targetsStack.length !== 0) {
				nextTarget = targetsStack[targetsStack.length - 1];
				nextRepetition = repHolder.getNextRepetition(cursor, leadsheetTarget);
				if (!nextRepetition) {
					targets.push({
						point: nextRepetition.getPoint(), 
						repetition: nextRepetition
					});
					continue;
				}
				nextTarget = targetsStack.pop();
				if (nextTarget.repetition != null) {
					
					nextRepetition = nextTarget.repetition;
					this.addSegmentsToList(segments, cursor, nextRepetition.getFromPoint());
					
					cursor = nextRepetition.updateCursor(cursor);
					var repUntilPoint = nextRepetition.getUntilPoint();
					nextTarget = targetsStack[targetsStack.length - 1];

					if (!nextTarget && !repUntilPoint && repUntilPoint.isBefore(nextTarget.point)) {
						targetsStack.push({
							point: nextRepetition.getUntilPoint()
						});
					}
				}
				else {
					this.addSegmentsToList(segments, cursor, nextTarget.getFromPoint());
					cursor = nextTarget.point.updateCursor();
					if (!cursor.point)
						break;
				}
			}
			return segments;
		};

		this.getUnfoldedSections = function(unfoldConfig) {
			var sections = [];
			var newUnfoldedSection, prevUnfoldedSection, segment;
			var segments = this.getSegments();
			for (var i = 0; i < segments.length; i++) {
				segment = segments[i];
				newUnfoldedSection = segment.toUnfoldedSection();

			}


		};
	};
	return LeadsheetStructure;
});