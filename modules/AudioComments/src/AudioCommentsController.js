define([
	'pubsub',
	'jquery',
	'modules/AudioComments/src/AudioCommentsModel',
	'modules/AudioComments/src/AudioCommentsView'
], function(pubsub, $, AudioCommentsModel, AudioCommentsView) {
	/**
	 * [AudioCommentsController description]
	 * @param {WaveController} waveMng        
	 * @param {LSViewer} viewer         
	 * @param {SongModel} songModel      
	 * @param {Object} userSession    with fields {'name': "Jon", id:'4abcgf4435', pathImg: 'path/to/img'}
	 * 
	 * @param {[type]} serverAudioComments [description]
	 */
	function AudioCommentsController(waveMng, viewer, songModel, userSession, serverAudioComments) {
		
		if (!userSession || !userSession.name || !userSession.id) {
			throw "AudioCommentsController - wrong params";
		}
		this.COLOR = "#FFBF00";
		this.waveMng = waveMng;

		this.model = new AudioCommentsModel(serverAudioComments);
		this.view = new AudioCommentsView(viewer);
		this.songModel = songModel;
		this.initSubscribe();
		this.user = userSession;
		this.commentsShowingBubble = [];
	}

	AudioCommentsController.prototype.initSubscribe = function() {
		var self = this;
		/**
		 * draw comments when audio has been drawn
		 */
		$.subscribe('WaveDrawer-audioDrawn', function() {
			self.view.draw(self.model, self.waveMng.drawer);
		});

		$.subscribe('WaveDrawer-selectedAudio', function(el, startCursor, endCursor) {
			self.view.showNewComment([startCursor, endCursor], self.waveMng.drawer);
		});

		$.subscribe('CommentSpaceManager-clickedComment', function(el, orderedIndex) {

			var keys = Object.keys(self.model.comments);
			var commentId = keys[orderedIndex];
			//If shown, hide. If hidden, show
			if (self.commentsShowingBubble.indexOf(commentId) === -1) {
				self.showComment(commentId, orderedIndex);
			} else {
				self.hideComment(commentId);
			}
		});
		$.subscribe('AudioCommentsView-closeBubble',function(el,commentId){
			self.hideComment(commentId);
		});
		$.subscribe('AudioCommentsView-saveComment', function(el, comment) {
			comment.userId = self.user.id;
			comment.userName = self.user.name;
			comment.img = self.user.img;
			comment.color = self.COLOR;
			self.addComment(comment, function(commentId){
				$.publish('ToViewer-draw', self.songModel);
				self.showComment(commentId);
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
			self.model.removeComment(commentId, function(){
				$.publish('ToViewer-draw', self.songModel);
			});
		});

	};
	AudioCommentsController.prototype.hideComment = function(commentId) {
		this.view.hideBubble("bubble" + commentId);
		//remove element from array
		var index = this.commentsShowingBubble.indexOf(commentId);
		this.commentsShowingBubble.splice(index, 1);
	};
	/**
	 * calls view showBubble, and saves info to remember that comment is being shown
	 * @param  {String} commentId    
	 * @param  {String} orderedIndex    
	 * @param  {Integer or String} orderedIndex 
	 */
	AudioCommentsController.prototype.showComment = function(commentId, orderedIndex) {
		orderedIndex = orderedIndex || this.model.getOrderedIndexByCommentId(commentId);
		this.commentsShowingBubble.push(commentId);
		this.view.showBubble(commentId, orderedIndex);
	};
	AudioCommentsController.prototype.addComment = function(comment, callback) {
		var self = this;
		this.model.addComment(comment, callback);
	};

	AudioCommentsController.prototype.updateComment = function(commentId,text) {
		var self = this;
		this.model.updateComment(commentId, text, function(){
			self.view.updateComment(commentId, text);
			self.showComment(commentId);	
		});
		
	};

	return AudioCommentsController;
});