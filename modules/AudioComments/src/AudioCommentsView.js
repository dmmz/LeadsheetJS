define([
	'mustache',
	'jquery',
	'modules/AudioComments/src/CommentSpaceManager',
	'text!modules/AudioComments/src/SpeechBubbleTpl.html',
	'text!modules/AudioComments/src/NewCommentTpl.html'
	], function(Mustache, $, CommentSpaceManager, SpeechBubbleTpl, NewCommentTpl){
	function AudioCommentsView(viewer){
		this.viewer = viewer;
		this.commentSpaceMng = null;
		this.bindEvents();
		this.newComment = {};
	}
	AudioCommentsView.prototype.bindEvents = function() {
		var self = this;
		//close comment
		$(document).on('click','.close',function(){
			var id = $(this).closest('.speech-bubble').attr('id');
			if (id == 'newComment'){
				self.hideNewComment();
			}else{
				self.hideBubble(id);	
			}
		});
		$(document).on('click','#sendNewComment',function(){
			self.newComment.text = $(this).closest('.speech-bubble').find('textarea').val();
			$.publish('save-comment', self.newComment);
			self.hideNewComment();
		});

	};
	AudioCommentsView.prototype.draw = function(audioCommentsModel, waveDrawer) {
		//we construct it here because it add himself to canvasLayer which exists only after the score is drawn
		this.commentSpaceMng = new CommentSpaceManager(this.viewer); 
		var comments = audioCommentsModel.comments;
		var ctx = this.viewer.ctx;
		var self = this;

		this.drawNewComment();

		this.viewer.drawElem(function() {
			for (var i = 0; i < comments.length; i++) {
				self.drawComment(comments[i], ctx, waveDrawer);
				self.drawBubble(comments[i], i);
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

	AudioCommentsView.prototype.drawBubble = function(comment, index) {
		
		var el = Mustache.render(SpeechBubbleTpl,{textComment:comment.text});
		var offset = $("#ls1").offset(); //TODO: dynamic id
		$("body").append($(el).attr('id', "bubble"+index).hide());

	};
	AudioCommentsView.prototype.drawNewComment = function() {
		var el = Mustache.render(NewCommentTpl);
		$("body").append($(el).hide());		
	};
	AudioCommentsView.prototype.showBubble = function(index, comment) {
		var height = $("#bubble"+index).height();
		var offset = $("#ls1").offset();
		var area = this.commentSpaceMng.commentSpaces[index].getArea();
		$("#bubble"+index).css({
			top: area.y - area.h  + offset.top - height ,
			left:area.x + offset.left,
			height: height,
			zIndex:1900
		}).show();
	};
	AudioCommentsView.prototype.showNewComment = function(cursorPos, waveDrawer) {
		var areas = waveDrawer.getAreasFromTimeInterval(cursorPos[0], cursorPos[1]);
		this.newComment.timeInterval= [cursorPos[0], cursorPos[1]];

		var offset = $("#ls1").offset();
		height =  $("#newComment").height();
		$("#newComment").css({
			position: "absolute",
			top: areas[0].y + offset.top - height - 20,
			left: areas[0].x + offset.left,
			zIndex:1900
		}).show();
	};
	AudioCommentsView.prototype.hideBubble = function(id) {
		$("#" +id).hide();
	};
	AudioCommentsView.prototype.hideNewComment = function() {
		this.newComment = {};
		$("#newComment").find('textarea').val("");
		$("#newComment").hide();
	};
	return AudioCommentsView;
});