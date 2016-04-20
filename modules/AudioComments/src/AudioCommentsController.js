define([
	'pubsub',
	'jquery',
	'modules/AudioComments/src/AudioCommentsModel',
	'modules/AudioComments/src/AudioCommentsView'
], function(pubsub, $, AudioCommentsModel, AudioCommentsView) {
	/**
	 * Audio comments controller
	 * @exports AudioComments/AudioCommentsController
	 * @param {AudioModule} audio        
	 * @param {LSViewer} viewer         
	 * @param {SongModel} songModel      
	 * @param {Object} userSession    with fields {'name': "Jon", id:'4abcgf4435', pathImg: 'path/to/img'}
	 * 
	 * @param {Object} serverAudioComments is an external objects that can allow to save comment to a server
	 */
	function AudioCommentsController(audio, viewer, songModel, userSession, noteSpaceMng, notesCursor, serverAudioComments) {
		if (!audio || !viewer || !songModel || !userSession || !userSession.name || !userSession.id){
			throw "AudioCommentsController - wrong params";
		}
		this.audio = audio;

		this.model = new AudioCommentsModel(serverAudioComments);
		this.view = new AudioCommentsView(viewer, noteSpaceMng, notesCursor, songModel);
		this.songModel = songModel;
		this.noteSpaceMng = noteSpaceMng;
		this.initSubscribe();
		this.user = userSession;
		this.commentsShowingBubble = [];
	}

	AudioCommentsController.prototype.initSubscribe = function() {
		var self = this;
		/**
		 * draw comments when audio has been drawn
		 */
		$.subscribe('AudioDrawer-audioDrawn', function() {
			self.model.getComments('audio',function(comments) {
				self.view.draw(comments, self.audio.drawer.audioCursor, self.noteSpaceMng, self.user.id);
			});
		});

		//ScoreComments
		$.subscribe('LSViewer-drawEnd', function() {
			self.model.getComments('score',function(comments) {
				self.view.draw(comments, self.audio.drawer.audioCursor, self.noteSpaceMng, self.user.id);
			});
		});

		$.subscribe('AudioCursor-selectedAudio', function(el, startCursor, endCursor) {
			self.view.showNewComment([startCursor, endCursor], self.audio.drawer.audioCursor);
		});

		$.subscribe('K-key', function(el){
			self.view.showNewScoreComment(self.songModel);
		});

		$.subscribe('CommentSpaceManager-clickedComment', function(el, commentId) {
			//If shown, hide. If hidden, show
			if (self.commentsShowingBubble.indexOf(commentId) === -1) {
				self.showComment(commentId/*, orderedIndex*/);
			} else {
				self.hideComment(commentId);
			}
		});
		$.subscribe('AudioCommentsView-closeBubble', function(el, commentId) {
			self.hideComment(commentId);
		});
		$.subscribe('AudioCommentsView-saveComment', function(el, comment) {
			comment.userId = self.user.id;
			comment.userName = self.user.name;
			comment.img = self.user.img;
			comment.type = self.view.newComment.type;
			self.saveComment(comment, function(commentId) {
				$.publish('ToViewer-draw', self.songModel);
				//we show comment bubble after waiting 200 ms, time enough to let 'toViewer-draw' finish drawing all comments, otherwise it would give an error
				setTimeout(function() {
					self.showComment(commentId);
				}, 200);
			});
		});
		$.subscribe('AudioCommentsView-updateComment', function(el, commentId, text) {
			self.updateComment(commentId, text);
		});
		$.subscribe('AudioCommentsView-editingComment', function(el, bubbleEl, commentId) {
			var comment = self.model.getComment(commentId);
			self.view.showEditingComment(bubbleEl, comment.text, commentId);
		});
		$.subscribe('AudioCommentsView-removingComment', function(el, bubbleEl, commentId) {
			bubbleEl.remove();
			self.model.removeComment(commentId, function() {
				$.publish('ToViewer-draw', self.songModel);
			});
		});

	};
	AudioCommentsController.prototype.hideComment = function(commentId) {
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
	AudioCommentsController.prototype.showComment = function(commentId, orderedIndex) {
		//orderedIndex = orderedIndex || this.model.getOrderedIndexByCommentId(commentId);
		if (this.commentsShowingBubble.indexOf(commentId) === -1){
			this.commentsShowingBubble.push(commentId);	
		}
		this.view.showBubble(commentId/*, orderedIndex*/);
	};
	AudioCommentsController.prototype.saveComment = function(comment, callback) {
		var self = this;
		this.model.saveComment(comment, callback);
	};
	AudioCommentsController.prototype.updateComment = function(commentId, text) {
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
	AudioCommentsController.prototype.addComment = function(comment) {
		this.model.addComment(comment);
	};
	return AudioCommentsController;
});