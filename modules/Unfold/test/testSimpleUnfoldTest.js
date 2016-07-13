define([
	'tests/songs/unfold/SimpleUnfoldTest',
	'modules/Unfold/test/UnfoldTester'], function(SimpleUnfoldTest, UnfoldTester) {
		return function(assert){
			var unfoldTester = UnfoldTester(assert);
			var struct = unfoldTester.init(SimpleUnfoldTest);
			var startLabels = struct.getStartLabels();
			var endLabels = struct.getEndLabels();
			var sectionStartPoints = struct.getSectionStartPoints();
			assert.equal(startLabels.size, 5);
			assert.equal(endLabels.size, 7, "Total number of endLabels");
			unfoldTester.compareObject(endLabels.get('end_section_0_0'), {
				section: 0,
				bar: 2,
				playIndex: 0
			},'end_section_0_0');	
			unfoldTester.compareObject(endLabels.get('end_section_0_1'), {
				section: 0,
				bar: 3,
				playIndex: 1
			},'end_section_0_1');
			unfoldTester.compareObject(endLabels.get('Coda'), {
				section: 0,
				bar: 1,
				playIndex: 0
			},'Coda');
			unfoldTester.compareObject(endLabels.get('end_section_1_0'), {
				section: 1,
				bar: 1,
				playIndex: 0
			}, 'end_section_1_0');
			unfoldTester.compareObject(endLabels.get('DC al Coda'), {
				section: 1,
				bar: 1,
				playIndex: 0
			}, 'DC al Coda');
			unfoldTester.compareObject(endLabels.get('end_section_2_0'), {
				section: 2,
				bar: 1,
				playIndex: 0
			},'end_section_2_0');
			unfoldTester.compareObject(endLabels.get('End'), {
				section: 2,
				bar: 1,
				playIndex: 0
			}, 'End');	
				
			//START LABELS
			assert.equal(startLabels.size, 5, "Total number of startLabels");
			unfoldTester.compareObject(startLabels.get('CAPO'), {
				section: 0,
				bar: 0,
				playIndex: 0
			}, 'CAPO');
			unfoldTester.compareObject(startLabels.get('start_section_0'), {
				section: 0,
				bar: 0,
				playIndex: 0
			},'start_section_0');
			unfoldTester.compareObject(startLabels.get('start_section_1'), {
				section: 1,
				bar: 0,
				playIndex: 0
			},'start_section_1');
			unfoldTester.compareObject(startLabels.get('start_section_2'), {
				section: 2,
				bar: 0,
				playIndex: 0
			},'start_section_2');
			unfoldTester.compareObject(startLabels.get('CODATO'), {
				section: 2,
				bar: 0,
				playIndex: 0
			},'CODATO');
			//Add tests for Start and end points ??
						
			var segments = struct.getSegments();
			assert.equal(segments.length, 5);
			
			unfoldTester.compareSegment(segments[0], [0,1,2], 0);
			unfoldTester.compareSegment(segments[1], [0,1,3], 0);
			unfoldTester.compareSegment(segments[2], [0,1], 1);
			unfoldTester.compareSegment(segments[3], [0,1], 0);
			unfoldTester.compareSegment(segments[4], [0,1], 2);
			// var unfoldedSong = unfoldTester.getSong().initUnfoldedSong();
			// var unfoldedSections = struct.getUnfoldedLeadsheet(unfoldedSong, segments).getSections();
		};
	}
);