define([
	'modules/NoteEdition/src/NoteSpaceView',
	'modules/LSViewer/src/Scaler'
	],
	function(NoteSpaceView,Scaler) {
	return {
		run: function() {

			test("isInPath", function(assert) {
				var scaler = new Scaler(1);
				var note = new NoteSpaceView({x:8,y:8,w:4,h:4},scaler);
				//relation between area points and note space
				// all points inside
				assert.ok(note.isInPath({x:10,y:10,xe:11,ye:11}));		
				// all points outside
				assert.ok(!note.isInPath({x:13,y:13,xe:15,ye:15}));
				// left points inside
				assert.ok(note.isInPath({x:9,y:10,xe:14,ye:14}));
				//right points inside
				assert.ok(note.isInPath({x:2,y:4,xe:11,ye:11}));
				//top points inside
				assert.ok(note.isInPath({x:9,y:9,xe:11,ye:20}));
				//bottom points inside
				assert.ok(note.isInPath({x:3,y:4,xe:10,ye:10}));
				//top-left point inside
				assert.ok(note.isInPath({x:9,y:9,xe:20,ye:20}));
				//top-right point inside
				assert.ok(note.isInPath({x:2,y:9,xe:12,ye:20}));
				//bottom-left point inside
				assert.ok(note.isInPath({x:9,y:3,xe:12,ye:20}));
				//bottom-right point inside
				assert.ok(note.isInPath({x:2,y:3,xe:12,ye:12}));
			});
		}
	};
});