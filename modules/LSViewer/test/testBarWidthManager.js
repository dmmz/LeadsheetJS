define(['modules/LSViewer/src/BarWidthManager'], function(BarWidthManager) {
	return {
		run: function() {
			var lineHeight = 150,
				lineWidth = 1160,
				noteWidth = 20,
				barsPerLine = 4,
				marginTop = 100,
				barWidth = lineWidth / barsPerLine, //	1160 / 4 = 290
				minWidths,
				abtlResult,
				abtlExpectedResult,
				swResult,
				swExpectedResult;

			test("BarWidthManager", function(assert) {

				//Test1: no bar is too wide
				var barWidthMng = new BarWidthManager(lineHeight, lineWidth, noteWidth, barsPerLine, marginTop);

				minWidths = [100, 100, 100, 100,
					100, 100, 100, 100
				];
				abtlExpectedResult = [
					[100, 100, 100, 100],
					[100, 100, 100, 100]
				];

				abtlResult = barWidthMng.assignBarsToLines(minWidths);
				assert.deepEqual(abtlResult, abtlExpectedResult);

				swExpectedResult = [
					[barWidth, barWidth, barWidth, barWidth],
					[barWidth, barWidth, barWidth, barWidth]
				];
				swResult = barWidthMng.getWidths(abtlResult);
				assert.deepEqual(swResult, swExpectedResult);

				barWidthMng.setBarsStruct(swResult);
				assert.ok(barWidthMng.inSameLine(0,3));
				assert.ok(!barWidthMng.inSameLine(3,4));
				assert.ok(barWidthMng.inSameLine(4,7));

				//Test2: in first line last bar is too wide
				minWidths = [100, 100, 100, 470,
					500, 300, 100, 100
				];
				abtlExpectedResult = [
					[100, 100, 100, 470],
					[500, 300, 100, 100]
				];
				abtlResult = barWidthMng.assignBarsToLines(minWidths);
				assert.deepEqual(abtlResult, abtlExpectedResult);

				swExpectedResult = [
					[230, 230, 230, 470],
					[500, 300, 180, 180]
				];

				swResult = barWidthMng.getWidths(abtlResult);
				assert.deepEqual(swResult, swExpectedResult);

				barWidthMng.setBarsStruct(swResult);
				assert.ok(barWidthMng.inSameLine(0,3));
				assert.ok(!barWidthMng.inSameLine(3,4));
				assert.ok(barWidthMng.inSameLine(4,7));

				//Test3: all bars in first line almost fit, but last one does not
				minWidths = [290, 290, 290, 300,
					100, 100, 100, 100
				];
				abtlExpectedResult = [
					[290, 290, 290],
					[300, 100, 100, 100, 100]
				];
				abtlResult = barWidthMng.assignBarsToLines(minWidths);
				assert.deepEqual(abtlResult, abtlExpectedResult);

				swExpectedResult = [
					[386.667, 386.667, 386.667],
					[300, 215, 215, 215, 215]
				];
				swResult = barWidthMng.getWidths(abtlResult);
				assert.deepEqual(swResult, swExpectedResult);

				barWidthMng.setBarsStruct(swResult);
				assert.ok(barWidthMng.inSameLine(0,2));
				assert.ok(!barWidthMng.inSameLine(2,3));
				assert.ok(barWidthMng.inSameLine(3,7));

				//Test4: first bar is already wider that one line
				minWidths = [1290, 290, 290, 300,
					100, 100, 100, 100
				];
				abtlExpectedResult = [
					[lineWidth],
					[290, 290, 300, 100, 100],
					[100, 100]
				];
				abtlResult = barWidthMng.assignBarsToLines(minWidths);
				assert.deepEqual(abtlResult, abtlExpectedResult);
				swResult = barWidthMng.getWidths(abtlResult);
				

				swExpectedResult = [
					[lineWidth],
					[290, 290, 300, 140, 140],
					[580, 580]
				];
				assert.deepEqual(swResult, swExpectedResult);
				
				barWidthMng.setBarsStruct(swResult);
				assert.ok(!barWidthMng.inSameLine(0,1));
				assert.ok(barWidthMng.inSameLine(1,5));
				assert.ok(!barWidthMng.inSameLine(5,6));

				//Test5: 3rd and 4th bars are wider than one line
				minWidths = [290, 290, 1300, 1300,
					200, 200, 200, 200
				];
				abtlExpectedResult = [
					[290, 290],
					[lineWidth],
					[lineWidth],
					[200, 200, 200, 200]
				];
				abtlResult = barWidthMng.assignBarsToLines(minWidths);
				assert.deepEqual(abtlResult, abtlExpectedResult);

				swExpectedResult = [
					[580, 580],
					[lineWidth],
					[lineWidth],
					[barWidth, barWidth, barWidth, barWidth]
				];
				swResult = barWidthMng.getWidths(abtlResult);
				assert.deepEqual(swResult, swExpectedResult);

				barWidthMng.setBarsStruct(swResult);
				assert.ok(barWidthMng.inSameLine(0,1));
				assert.ok(!barWidthMng.inSameLine(1,2));
				assert.ok(!barWidthMng.inSameLine(2,3));
			});
		}
	};
});