define([
	'modules/Edition/src/ElementView',
	'modules/LSViewer/src/Scaler'
	],
	function(ElementView,Scaler) {
	return {
		run: function() {

			test("Element View - isInPath", function(assert) {
				var scaler = new Scaler(1);
				var position = {x:8,y:8,w:4,h:4};
				//relation between area points and note space
				// all points inside
				assert.ok(ElementView.isInPath({x:10,y:10,xe:11,ye:11}, position, scaler));
				// all points outside
				assert.ok(!ElementView.isInPath({x:13,y:13,xe:15,ye:15}, position, scaler));
				// left points inside
				assert.ok(ElementView.isInPath({x:9,y:10,xe:14,ye:14}, position, scaler));
				//right points inside
				assert.ok(ElementView.isInPath({x:2,y:4,xe:11,ye:11}, position, scaler));
				//top points inside
				assert.ok(ElementView.isInPath({x:9,y:9,xe:11,ye:20}, position, scaler));
				//bottom points inside
				assert.ok(ElementView.isInPath({x:3,y:4,xe:10,ye:10}, position, scaler));
				//top-left point inside
				assert.ok(ElementView.isInPath({x:9,y:9,xe:20,ye:20}, position, scaler));
				//top-right point inside
				assert.ok(ElementView.isInPath({x:2,y:9,xe:12,ye:20}, position, scaler));
				//bottom-left point inside
				assert.ok(ElementView.isInPath({x:9,y:3,xe:12,ye:20}, position, scaler));
				//bottom-right point inside
				assert.ok(ElementView.isInPath({x:2,y:3,xe:12,ye:12}, position, scaler));
			});
		}
	};
});