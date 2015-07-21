define([
	'mustache',
	'jquery',
	'modules/AudioComments/src/CommentSpaceManager',
	'text!modules/AudioComments/src/SpeechBubbleTpl.html',
	'text!modules/AudioComments/src/NewCommentTpl.html'
], function(Mustache, $, CommentSpaceManager, SpeechBubbleTpl, NewCommentTpl) {

	function AudioCommentsView(viewer) {
		this.viewer = viewer;
		this.COLOR = "#FFBF00";
		this.commentSpaceMng = null;
		this.initController();
		this.newComment = {};
		this.offset = $("#" + viewer.canvasId).offset();
		this.newCommentId = "newComment";
		this.bubblePreId = "bubble"; //prefix Id, the comments of bubbles' id will be, bubble0, bubble1...etc.
	}

	/**
	 * jquery events
	 */
	AudioCommentsView.prototype.initController = function() {
		var self = this;
		//close comment
		$(document).on('click', '.close', function() {
			var id = $(this).closest('.speech-bubble').attr('id');
			if (id == self.newCommentId) {
				self.hideNewComment();
			} else {
				id = id.substr(self.bubblePreId.length, id.length); //extracting prefix "bubble", to get id X on "bubbleX"
				$.publish('AudioCommentsView-closeBubble', id);
			}
		});
		//new comment
		$(document).on('click', '#sendNewComment', function() {
			var commentEl = $(this).closest('.speech-bubble');
			var text = commentEl.find('textarea').val();
			var commentId = commentEl.find('input[name="commentId"]').val();

			if (commentId.length !== 0) {
				$.publish('AudioCommentsView-updateComment', [commentId, text]);
			} else {
				self.newComment.text = text;
				$.publish('AudioCommentsView-saveComment', self.newComment);
			}
			self.hideNewComment();
		});

		//edit comment
		$(document).on('click', '.edit-comment', function() {
			var commentEl = $(this).closest('.speech-bubble'),
				commentId = commentEl.attr('data-commentId');
			$.publish('AudioCommentsView-editingComment', [commentEl, commentId]);
		});

		//remove comment
		$(document).on('click', '.remove-comment', function() {
			var commentEl = $(this).closest('.speech-bubble'),
				commentId = commentEl.attr('data-commentId');
			$.publish('AudioCommentsView-removingComment', [commentEl, commentId]);
		});
	};

	AudioCommentsView.prototype._htmlIdExists = function(id) {
		return $("#" + id).length !== 0;
	};
	/**
	 * called by AudioCommentsController
	 * draws comment marker (with the picture and the name)
	 * @param  {AudioCommentsModel} audioCommentsModel
	 * @param  {WaveDrawer} waveDrawer
	 */
	AudioCommentsView.prototype.draw = function(audioCommentsModel, waveDrawer, userId) {
		//we construct it here because it adds himself to canvasLayer which exists only after the score is drawn
		this.commentSpaceMng = new CommentSpaceManager(this.viewer);

		var comments = audioCommentsModel.comments,
			ctx = this.viewer.ctx,
			self = this;

		//draw only if doesn't exists, to avoid duplicates 
		//(html elements are different from canvas elements, html elements are not reset in every LSViewer draw whereas canvas elements are)
		if (!this._htmlIdExists(this.newCommentId)) {
			this.drawNewComment();
		}

		//draw using drawElem to respect scaling
		this.viewer.drawElem(function() {
			var bubbleId;
			for (var i in comments) {
				self.drawComment(comments[i], ctx, waveDrawer);
				bubbleId = self.bubblePreId + comments[i].id;
				if (!self._htmlIdExists(bubbleId)) {
					self.drawBubble(comments[i], bubbleId, userId);
				}
			}
		});
	};

	AudioCommentsView.prototype.drawComment = function(comment, ctx, waveDrawer) {
		var saveFillColor = ctx.fillStyle;
		var clickableArea;
		ctx.fillStyle = this.COLOR;
		ctx.strokeStyle = this.COLOR;
		var areas = waveDrawer.getAreasFromTimeInterval(comment.timeInterval[0], comment.timeInterval[1]);

		ctx.beginPath();
		ctx.lineWidth = 5;
		//draw border top of comment marker
		for (i = 0, c = areas.length; i < c; i++) {
			ctx.moveTo(areas[i].x, areas[i].y);
			ctx.lineTo(areas[i].x + areas[i].w, areas[i].y);
		}
		ctx.stroke();

		ctx.lineWidth = 1;
		//draw border left, to indicate time start of audio comment
		ctx.moveTo(areas[0].x, areas[0].y);
		ctx.lineTo(areas[0].x, areas[0].y + areas[0].h);

		//draw border right, to indicate time end of audio comment
		var lastArea = areas.length - 1;
		ctx.moveTo(areas[lastArea].x + areas[lastArea].w - 1, areas[lastArea].y);
		ctx.lineTo(areas[lastArea].x + areas[lastArea].w - 1, areas[lastArea].y + areas[0].h);
		ctx.closePath();
		ctx.stroke();

		ctx.font = "12px Arial";
		var text = ctx.measureText(comment.userName);
		var widthBox = 100;
		if (text.width > widthBox) {
			widthBox = text.width + 50; // 50 stand for 30px image width + padding/margin
		}

		//draw little box with picture and name, which will be clickable
		clickableArea = {
			x: areas[0].x,
			y: areas[0].y - 30,
			w: widthBox,
			h: 30
		};

		ctx.strokeRect(clickableArea.x, clickableArea.y, clickableArea.w, clickableArea.h);
		ctx.globalAlpha = 0.7;
		ctx.fillRect(clickableArea.x, clickableArea.y, clickableArea.w, clickableArea.h);
		ctx.globalAlpha = 1;
		var img = new Image();
		img.onload = function() {
			ctx.drawImage(img, areas[0].x, areas[0].y - 30, 30, 30);
		};
		ctx.fillStyle = "#000";
		ctx.textBaseline = 'bottom';
		img.src = comment.img;

		ctx.fillText(comment.userName, areas[0].x + 38, areas[0].y - 15);

		if (comment.date !== undefined) {
			ctx.font = "10px Arial";
			ctx.fillText("(" + comment.date + ")", areas[0].x + 35, areas[0].y - 2);
		}

		ctx.fillStyle = saveFillColor;
		//add clickable area to commentSpaceMgn
		this.commentSpaceMng.addCommentSpace(clickableArea);
	};

	/**
	 * Bubble is a HTML div, it is drawn as a hidden element after every LSViewer draw
	 * @param  {Object} comment
	 * @param  {String} bubbleId
	 * @param  {String} userId
	 */
	AudioCommentsView.prototype.drawBubble = function(comment, bubbleId, userId) {
		var el = Mustache.render(SpeechBubbleTpl, {
			textComment: comment.text,
			ownComment: comment.userId == userId
		});

		$("body").append(
			$(el).attr('id', bubbleId)
			.attr('data-commentId', comment.id)
			.hide()
		);
	};

	/**
	 * NewComment represents the editable bubble with empty textare, drawn here as hidden
	 */
	AudioCommentsView.prototype.drawNewComment = function() {
		var el = Mustache.render(NewCommentTpl);
		$("body").append($(el).hide());
	};

	/**
	 * show bubble is called when clicking on box with picture and name
	 * @param  {String} commentId  Id of the comment, coincides with the key of the comments object in the model
	 * @param  {Integer} index   refers to the index of the space manager, which is an ordered index, unlike comment Id
	 *                           e.g. if we have removed comment with id 2, keys of comments is ["0","1","3","4"] whereas corresponding indexes will be [0,1,2,3], so when *                           commentId is 2, index will be 3 (works well as every time a comment is added or deleted, everything is recalculated)
	 */
	AudioCommentsView.prototype.showBubble = function(commentId, index) {
		var height = $("#" + this.bubblePreId + commentId).height();

		var area = this.commentSpaceMng.commentSpaces[index].getArea();
		var offset = this.offset; //to avoid 'this' closure problem
		$("#bubble" + commentId).css({
			top: area.y - area.h + offset.top - height,
			left: area.x + offset.left,
			height: height,
			zIndex: 1900
		}).show();
	};

	/**
	 * When click on 'edit' in a comment, what we do is hide the actual comment and show 'new comment' bubble with the text of the current comment
	 * @param  {JQuery Element}		bubbleEl    
	 * @param  {String}				commentText text of current comment
	 * @param  {String}				commentId   
	 */
	AudioCommentsView.prototype.showEditingComment = function(bubbleEl, commentText, commentId) {
		function getOldCommentPosition(bubbleEl, newCommentId) {
			var offset = $(bubbleEl).offset();
			var oldCommentHeight = $(bubbleEl).outerHeight(true);
			var newCommentHeight = $("#" + newCommentId).outerHeight(true);
			return {
				x: offset.left,
				y: offset.top + oldCommentHeight - newCommentHeight
			};
		}
		//need to get point before hiding bubble
		var point = getOldCommentPosition(bubbleEl, this.newCommentId);
		this.hideBubble(bubbleEl.attr('id'));

		var newCommentEl = $("#" + this.newCommentId);

		newCommentEl.find('textarea').val(commentText);
		newCommentEl.find('input[name="commentId"]').val(commentId);
		newCommentEl.css({
			position: "absolute",
			top: point.y,
			left: point.x,
			zIndex: 1900
		}).show();
	};

	/**
	 * when select audio region we show 'new commment' bubble
	 * @param  {Array} cursorPos  [startTime, endTime]
	 * @param  {WaveDrawer} waveDrawer : to find area from cursorPos
	 */
	AudioCommentsView.prototype.showNewComment = function(cursorPos, waveDrawer) {
		var areas = waveDrawer.getAreasFromTimeInterval(cursorPos[0], cursorPos[1]);
		this.newComment.timeInterval = [cursorPos[0], cursorPos[1]];

		var offset = this.offset; //to avoid 'this' closure problem
		height = $("#" + this.newCommentId).outerHeight(true) + 8;
		$("#" + this.newCommentId).css({
			position: "absolute",
			top: areas[0].y + offset.top - height,
			left: areas[0].x + offset.left,
			zIndex: 1900
		}).show();
	};
	/**
	 * Update html text (updating model has been done from the controller)
	 * @param  {String} id    id of the comment
	 * @param  {String} text 
	 */
	AudioCommentsView.prototype.updateComment = function(id, text) {
		$("#" + this.bubblePreId + id + " .textComment").html(text);
	};
	/**
	 * @param  {String} bubbleId html id of bubble. 
	 * Normally a bubble id "bubbleX" starts always with prefix "bubble", but we can call this function with the prefix (ex. "bubble0abc") or the id directly (ex. "0abc")
	 * If there is no prefix, we add it
	 */
	AudioCommentsView.prototype.hideBubble = function(bubbleId) {
		if (bubbleId.indexOf(this.bubblePreId)==-1){
			bubbleId = this.bubblePreId + bubbleId;
		}
		$("#" + bubbleId).hide();
	};
	/**
	 * hides the 'new comment' bubble
	 */
	AudioCommentsView.prototype.hideNewComment = function() {
		this.newComment = {};
		var newCommentEl = $("#" + this.newCommentId);
		newCommentEl.find('input[name="commentId"]').val("");
		newCommentEl.find('textarea').val("");
		newCommentEl.hide();
	};
	return AudioCommentsView;
});