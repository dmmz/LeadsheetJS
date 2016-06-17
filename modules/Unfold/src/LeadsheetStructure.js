define([
	'modules/Unfold/src/PointLabel',
	'modules/Unfold/src/StartLabel',
	'modules/Unfold/src/StartPoint',
	'modules/Unfold/src/SectionStartPoint',
	'modules/Unfold/src/SectionRepetition',
	'modules/Unfold/src/SectionRepetitionFactory',
], function(PointLabel, StartLabel, StartPoint, SectionStartPoint, SectionRepetition, SectionRepetitionFactory) {

	var LeadsheetStructure = function(song) {
		var self = this;
		var startLabels = new Map();
		var endLabels = new Map();
		var sectionStartPoints = {};
		var sectionEndPoints = new Map();

		var lastSectionEndPoint = null;

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
			var endPoint = Object.create(EndPoint);
			endPoint.initValues(self, label, sectionNumber, barNumber, playIndex);
		};

		this.addStartLabel = function(point) {
			startLabels.set(point.getLabel(), point);
		};

		this.addEndLabel = function(point) {
			endLabels.put(point.getLabel(), point);
		};

		this.getStartLabels = function() {
			return startLabels;
		};

		this.getSectionPoints = function() {
			return sectionPoints;
		};

		this.getSectionStartPoint = function(iSection) {
			return sectionStartPoints[iSection];
		};
		this.getSectionEndPoint = function(iSection, playIndex) {
			return sectionEndPoints.get({
				iSection: iSection,
				playIndex: playIndex
			});

		};

		var addSectionPlayPoints = function(section, iSection, playIndex) {
			var sectionEndPoint = Object.create(SectionEndPoint);
			sectionEndPoint.callInitValues(self, iSection, playIndex);

			sectionStartPoints.put({
				section: iSection,
				playIndex: playIndex
			}, sectionEndPoint);
			lastSectionEndPoint = sectionEndPoint;
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
				toCodaPoint = getEndLabel(toCodaLabel);
			} else if (toCodaLabel == EndLabel.TOCODA2){

				if(!hasEndLabel(EndLabel.TOCODA)){
					return false;
				}
				//UNCMPLETE
			}
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
				for (playIndex = 0; playIndex < numPlays; playIndex++) {
					addRepetition(SectionRepetitionFactory.get(self, iSection, playIndex));
				}
			}
		};

		this.init = function() {
			if (self.sections.length === 0) {
				return;
			}
			createStartLabel(StartLabel.CAPO, 0, 1);
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
					for (var i = 0; i < PointLabel.getToCodaLabels.length; i++) {
						coda = PointLabel.getToCodaLabels[i];
						if(section.hasLabel(coda.name)){
							addCoda(coda, iSection, section.getLabel(coda.name));
						}
					}
				}

				//looking for solo labels (segno, segno2 and fine)
				

			}


		};
	};
	return LeadsheetStructure;
});