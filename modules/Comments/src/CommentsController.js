define([
	'pubsub',
	'jquery',
	'modules/Comments/src/CommentsModel',
	'modules/Comments/src/CommentsView'
], function(pubsub, $, CommentsModel, CommentsView) {
	/**
	 * Audio comments controller
	 * @exports AudioComments/CommentsController
	 * @param {AudioModule} audio        
	 * @param {LSViewer} viewer         
	 * @param {song} song      
	 * @param {Object} userSession    with fields {'name': "Jon", id:'4abcgf4435', pathImg: 'path/to/img'}
	 * 
	 * @param {Object} serverAudioComments is an external objects that can allow to save comment to a server
	 */
	function CommentsController(params, serverComments) {
		params = params || {};

		if (!params.viewer || !params.song || !params.userSession || !params.userSession.name || !params.userSession.id){
			throw "CommentsController - wrong params";
		}
		
		var audioDrawer = params.audio && params.audio.drawer ? params.audio.drawer : undefined;

		this.model = new CommentsModel(serverComments);
		this.view = new CommentsView(params.viewer, params.song, audioDrawer, params.noteSpaceManager, params.notesCursor, params.chordsEditor );
		this.song = params.song;
		this.user = params.userSession;
		this.commentsShowingBubble = [];
		this.initSubscribe();
	}

	CommentsController.prototype.initSubscribe = function() {
		var self = this;
		/**
		 * draw comments when audio has been drawn
		 */
		$.subscribe('AudioDrawer-audioDrawn', function() {
			self.model.getComments('audio',function(comments) {
				self.view.draw(comments, self.user.id);
			});
		});

		//ScoreComments
		$.subscribe('LSViewer-drawEnd', function() {
			self.model.getComments('score',function(comments) {
				self.view.draw(comments, self.user.id);
			});
		});
		//comments are activated by K-key
		$.subscribe('K-key', function(el){
			self.view.showNewComment();
		});
		// showing audio comment could be directly done on audio selection 
		// (BUT there is an issue, audioCursor is 'disabled', as we have not released the mouse button yet in this moment )
		// 
		// $.subscribe('AudioCursor-selectedAudio', function(el, startCursor, endCursor) {
		// 	self.view.showNewComment();
		// });


		$.subscribe('CommentSpaceManager-clickedComment', function(el, commentId) {
			//If shown, hide. If hidden, show
			if (self.commentsShowingBubble.indexOf(commentId) === -1) {
				self.showComment(commentId/*, orderedIndex*/);
			} else {
				self.hideComment(commentId);
			}
		});
		$.subscribe('CommentsView-closeBubble', function(el, commentId) {
			self.hideComment(commentId);
		});
		$.subscribe('CommentsView-saveComment', function(el, comment) {
			comment.userId = self.user.id;
			comment.userName = self.user.name;
			comment.img = self.user.img;
			comment.type = self.view.newComment.type;
			self.saveComment(comment, function(commentId) {
				$.publish('ToViewer-draw', self.song);
				//we show comment bubble after waiting 200 ms, time enough to let 'toViewer-draw' finish drawing all comments, otherwise it would give an error
				setTimeout(function() {
					self.showComment(commentId);
				}, 200);
			});
		});
		$.subscribe('CommentsView-updateComment', function(el, commentId, text) {
			self.updateComment(commentId, text);
		});
		$.subscribe('CommentsView-editingComment', function(el, bubbleEl, commentId) {
			var comment = self.model.getComment(commentId);
			self.view.showEditingComment(bubbleEl, comment.text, commentId, self);
		});
		$.subscribe('CommentsView-removingComment', function(el, bubbleEl, commentId) {
			bubbleEl.remove();
			self.model.removeComment(commentId, function() {
				$.publish('ToViewer-draw', self.song);
			});
		});

	};
	CommentsController.prototype.hideComment = function(commentId) {
		this.view.hideBubble(commentId);
		//remove element from array
		var index = this.commentsShowingBubble.indexOf(commentId);
		this.commentsShowingBubble.splice(index, 1);
	};
	/**
	 * calls view showBubble, and saves the information needed to remember that comment is being shown
	 * @param  {String} commentId    
	 * @param  {String} orderedIndex    
	 * @param  {Integer|String} orderedIndex 
	 */
	CommentsController.prototype.showComment = function(commentId, orderedIndex) {
		if (this.commentsShowingBubble.indexOf(commentId) === -1){
			this.commentsShowingBubble.push(commentId);	
		}
		this.view.showBubble(commentId);
	};
	CommentsController.prototype.saveComment = function(comment, callback) {
		var self = this;
		this.model.saveComment(comment, callback);
	};
	CommentsController.prototype.updateComment = function(commentId, text) {
		var self = this;
		this.model.updateComment(commentId, text, function() {
			self.view.updateComment(commentId, text);
			self.showComment(commentId);
		});
	};

	/**
	 * this function is only used in test examples, to load comments directly (when there is no database to load comments from)
	 * @param {String} comment
	 */
	CommentsController.prototype.addComment = function(comment) {
		this.model.addComment(comment);
	};
	return CommentsController;
});