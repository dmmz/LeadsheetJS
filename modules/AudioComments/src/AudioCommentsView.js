define(['modules/AudioComments/src/CommentSpaceManager'], function(CommentSpaceManager){
	function AudioCommentsView(viewer){
		this.viewer = viewer;
		this.commentSpaceMng = null;
	}
	AudioCommentsView.prototype.draw = function(audioCommentsModel, waveDrawer) {
		//we construct it here because it add himself to canvasLayer which exists only after the score is drawn
		this.commentSpaceMng = new CommentSpaceManager(this.viewer); 
		var comments = audioCommentsModel.comments;
		var ctx = this.viewer.ctx;
		var self = this;
		this.viewer.drawElem(function() {
			for (var i = 0; i < comments.length; i++) {
				self.drawComment(comments[i], ctx, waveDrawer);
			}
		});
	};
	AudioCommentsView.prototype.drawComment = function(comment, ctx, waveDrawer) {
		var saveFillColor = ctx.fillStyle;
		var clickableArea;
		ctx.fillStyle = comment.color;
		ctx.strokeStyle = comment.color;
		var areas = waveDrawer.getAreasFromTimeInterval(comment.timeInterval[0], comment.timeInterval[1]);
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
		
		clickableArea = {
			x: areas[0].x,
			y: areas[0].y - 30,
			w: 100,
			h: 30
		};
		ctx.beginPath();
		ctx.rect(clickableArea.x, clickableArea.y, clickableArea.w, clickableArea.h);
		ctx.globalAlpha = 0.2;
		ctx.fillRect(clickableArea.x, clickableArea.y, clickableArea.w, clickableArea.h);
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
		this.commentSpaceMng.addCommentSpace(clickableArea);
	};

	return AudioCommentsView;
});