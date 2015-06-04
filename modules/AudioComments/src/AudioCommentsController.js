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
		$.subscribe('audio-drawn', function() {
			self.view.draw(self.model,self.waveMng.drawer);
		});
		$.subscribe('clicked-comment', function(el, indexElem) {
			var comment = self.model.comments[indexElem];
			self.view.showBubble(indexElem,comment);
		});

		$.subscribe('selected-audio', function(el,startCursor, endCursor){
			self.view.showNewComment([startCursor, endCursor], self.waveMng.drawer);
		});

		$.subscribe('save-comment',function(el,comment){
			comment.user = 'Dani';
			comment.img = '/tests/img/dani-profile.jpg';
			comment.color = '#F00';
			self.addComment(comment);
			$.publish('ToViewer-draw', self.songModel);
		});
	};
	AudioCommentsController.prototype.addComment = function(comment) {
		this.model.addComment(comment);
	};
		
	return AudioCommentsController;
});