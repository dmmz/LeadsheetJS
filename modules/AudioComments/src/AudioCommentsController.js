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
		$.subscribe('audio-drawn', function() {
			self.view.draw(self.model, self.waveMng.drawer);
		});
		
		$.subscribe('clicked-comment', function(el, orderedIndex) {
			var keys = Object.keys(self.model.comments);
			var commentId = keys[orderedIndex];
			self.view.showBubble(commentId, orderedIndex);
		});

		$.subscribe('selected-audio', function(el, startCursor, endCursor) {
			self.view.showNewComment([startCursor, endCursor], self.waveMng.drawer);
		});

		/**TODO: integrate with user based data	 */
		$.subscribe('save-comment', function(el, comment) {
			comment.user = 'Dani';
			comment.img = '/tests/img/dani-profile.jpg';
			comment.color = '#F00';
			self.addComment(comment);
			$.publish('ToViewer-draw', self.songModel);
		});
		$.subscribe('update-comment', function(el, commentId, text) {
			self.model.updateComment(commentId, text);
			self.view.updateComment(commentId, text);
		});
		$.subscribe('editing-comment', function(el, bubbleEl, commentId) {
			var comment = self.model.getComment(commentId);
			self.view.showEditingComment(bubbleEl, comment.text, commentId);
		});
		$.subscribe('removing-comment', function(el, bubbleEl, commentId) {
			bubbleEl.remove();
			self.model.removeComment(commentId);
			$.publish('ToViewer-draw', self.songModel);
		});

	};
	AudioCommentsController.prototype.addComment = function(comment) {
		this.model.addComment(comment);
	};

	return AudioCommentsController;
});