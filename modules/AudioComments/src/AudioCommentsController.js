define([
	'pubsub',
	'jquery',
	'modules/AudioComments/src/AudioCommentsModel',
	'modules/AudioComments/src/AudioCommentsView'
], function(pubsub, $, AudioCommentsModel, AudioCommentsView) {
	function AudioCommentsController(waveMng, viewer, songModel) {
		this.waveMng = waveMng;
		this.model = new AudioCommentsModel();
		this.view = new AudioCommentsView(viewer);
		this.songModel = songModel;
		this.initSubscribe();
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
			self.view.showBubble(commentId, orderedIndex);
		});

		/**TODO: integrate with user based data	 */
		$.subscribe('AudioCommentsView-saveComment', function(el, comment) {
			comment.user = 'Dani';
			comment.img = '/tests/img/dani-profile.jpg';
			comment.color = '#F00';
			self.addComment(comment);
			$.publish('ToViewer-draw', self.songModel);
		});
		$.subscribe('AudioCommentsView-updateComment', function(el, commentId, text) {
			updateComment(commentId, text);
		});
		$.subscribe('AudioCommentsView-editingComment', function(el, bubbleEl, commentId) {
			var comment = self.model.getComment(commentId);
			self.view.showEditingComment(bubbleEl, comment.text, commentId);
		});
		$.subscribe('AudioCommentsView-removingComment', function(el, bubbleEl, commentId) {
			bubbleEl.remove();
			self.model.removeComment(commentId);
			$.publish('ToViewer-draw', self.songModel);
		});

	};

	AudioCommentsController.prototype.addComment = function(comment) {
		this.model.addComment(comment);
	};

	AudioCommentsController.prototype.updateComment = function(comment) {
		this.model.updateComment(commentId, text);
		this.view.updateComment(commentId, text);
	};

	return AudioCommentsController;
});