define([
	'pubsub',
	'jquery'
], function(pubsub, $) {
	function AudioComments(waveMng, viewer) {
		this.waveMng = waveMng;
		this.viewer = viewer;
		this.comments = [];
		this.initSubscribe();
	}
	AudioComments.prototype.initSubscribe = function(first_argument) {
		var self = this;
		$.subscribe('Audio-Loaded', function() {
			self.draw();
		});
	};
	AudioComments.prototype.addComment = function(comment) {
		this.comments.push(comment);
	};
	AudioComments.prototype.drawComment = function(comment, ctx) {
		var saveFillColor = ctx.fillStyle;
		ctx.fillStyle = comment.color;
		ctx.strokeStyle = comment.color;
		var areas = this.waveMng.drawer.getAreasFromTimeInterval(comment.timeInterval[0], comment.timeInterval[1]);
		for (i = 0, c = areas.length; i < c; i++) {
			ctx.fillRect(
				areas[i].x,
				areas[i].y,
				areas[i].w,
				areas[i].h / 20
			);
		}
		ctx.fillRect(
			areas[0].x,
			areas[0].y,
			1,
			areas[0].h
		);
		var lastArea = areas.length - 1;
		ctx.fillRect(
			areas[lastArea].x + areas[lastArea].w - 1,
			areas[lastArea].y,
			1,
			areas[0].h
		);
		
		ctx.beginPath();
		ctx.rect(areas[0].x, areas[0].y - 30, 100, 30);
		ctx.globalAlpha=  0.2;
		ctx.fillRect(areas[0].x, areas[0].y - 30, 100, 30);
		ctx.globalAlpha=  1;
		ctx.stroke(); 
		var img = new Image();
		img.onload = function() {
			ctx.drawImage(img, areas[0].x, areas[0].y - 30, 30, 30);
		};

		ctx.fillStyle = "#000";
		img.src = comment.img;
		ctx.textBaseline = 'bottom';
		ctx.font = "15px lato Verdana";
		ctx.fillText(comment.user, areas[0].x + 40, areas[0].y - 10);

		ctx.fillStyle = saveFillColor;
	};
	AudioComments.prototype.draw = function() {
		var ctx = this.viewer.ctx;
		var self = this;
		this.viewer.drawElem(function() {
			for (var i = 0; i < self.comments.length; i++) {
				self.drawComment(self.comments[i], ctx);
			}
		});

	};
	return AudioComments;
});